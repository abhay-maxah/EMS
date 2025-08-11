import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto, LeaveDayDto } from './dto/create-leave-dto';
import { Leave, LeaveStatus, LeaveType, User } from '@prisma/client';
import { NotificationGateway } from 'src/notification-gateway/notification.gateway';
type PartialLeave = {
  startDate: Date;
  endDate: Date | null;
  status: LeaveStatus;
  leaveType: LeaveType;
  totalLeaveDay: number | null;
};
export type DetailedLeaveResponse = {
  id: number;
  startDate: Date;
  endDate: Date | null;
  status: LeaveStatus;
  leaveType: LeaveType;
  totalLeaveDay: number | null;
  reason: string;
  appliedAt: Date;
  approvedRejectedAt: Date | null;
  adminNote: string | null;
  days: {
    id: number;
    date: Date;
    leaveType: string;
    leaveId: number;
  }[];
};

export type LeaveResponseWithUser = {
  leave: DetailedLeaveResponse;
  appliedBy: {
    id: string;
    email: string;
    role: string;
    name: string | null;
  };
};

@Injectable()
export class LeaveService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}
  //applyLeave (admin,user)
  async create(userId: string, createLeaveDto: CreateLeaveDto): Promise<Leave> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userInfo: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const { startDate, endDate, totalLeaveDay, days, leaveType, ...rest } =
      createLeaveDto;

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (parsedStartDate > parsedEndDate) {
      throw new BadRequestException('Start date cannot be after end date.');
    }

    if (!days || days.length === 0) {
      throw new BadRequestException('At least one leave day must be provided.');
    }

    if (!totalLeaveDay || totalLeaveDay <= 0) {
      throw new BadRequestException(
        'Total leave day must be a positive number.',
      );
    }

    if (
      leaveType !== LeaveType.UNPAID_LEAVE &&
      totalLeaveDay > user.totalLeaveDays
    ) {
      throw new BadRequestException(
        `Insufficient leave balance. You only have ${user.totalLeaveDays} day(s) remaining.`,
      );
    }

    const leaveDaysToCreate = days.map((day: LeaveDayDto) => ({
      date: new Date(day.date),
      leaveType: day.dayType,
    }));

    const newLeave = await this.prisma.leave.create({
      data: {
        userId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        totalLeaveDay,
        leaveType,
        ...rest,
        appliedAt: new Date(),
        status: LeaveStatus.PENDING,
        days: {
          createMany: {
            data: leaveDaysToCreate,
            skipDuplicates: true,
          },
        },
      },
    });

    // ✅ Fetch full details for notification
    const fullLeave = await this.prisma.leave.findUnique({
      where: { id: newLeave.id },
      include: {
        days: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            userInfo: {
              select: { name: true },
            },
          },
        },
      },
    });

    // ✅ Send complete leave details to frontend
    this.notificationGateway.notifyLeaveApplied(fullLeave);

    return newLeave;
  }

  async getUserInfo(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        team: true,
        userInfo: {
          select: {
            name: true,
          },
        },
      },
    });
    return user;
  }
  async getAllLeavForUser(
    currentUser: User,
    options: {
      page?: number;
      limit?: number;
      year?: 'all' | 'current' | 'last';
    } = {},
  ): Promise<{
    leave: PartialLeave[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, year = 'all' } = options;

    const now = new Date();
    let startDateFilter: Date | undefined;
    let endDateFilter: Date | undefined;

    if (year === 'current') {
      startDateFilter = new Date(now.getFullYear(), 0, 1); // Jan 1st current year
      endDateFilter = new Date(now.getFullYear(), 11, 31); // Dec 31st current year
    } else if (year === 'last') {
      startDateFilter = new Date(now.getFullYear() - 1, 0, 1); // Jan 1st last year
      endDateFilter = new Date(now.getFullYear() - 1, 11, 31); // Dec 31st last year
    }

    const whereClause: any = {
      userId: currentUser.id,
    };

    if (startDateFilter && endDateFilter) {
      whereClause.startDate = {
        gte: startDateFilter,
        lte: endDateFilter,
      };
    }

    const [leave, total] = await Promise.all([
      this.prisma.leave.findMany({
        where: whereClause,
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          leaveType: true,
          totalLeaveDay: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.leave.count({
        where: whereClause,
      }),
    ]);

    return {
      leave,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllLeavForAdmin(
    companyId: string,
    options: {
      page: number;
      limit: number;
      year: 'all' | 'current' | 'last';
      userName?: string;
    },
  ): Promise<{
    data: {
      id: number;
      startDate: Date;
      endDate: Date | null;
      status: string;
      leaveType: string;
      totalLeaveDay: number | null;
      user: {
        userName: string;
        userInfo: {
          name: string;
        } | null;
      };
    }[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page, limit, year, userName } = options;

    const now = new Date();
    const currentYear = now.getFullYear();

    // Year filter logic
    const dateFilter: { startDate?: any } = {};
    if (year === 'current') {
      dateFilter.startDate = {
        gte: new Date(currentYear, 0, 1),
        lte: new Date(currentYear, 11, 31, 23, 59, 59),
      };
    } else if (year === 'last') {
      dateFilter.startDate = {
        gte: new Date(currentYear - 1, 0, 1),
        lte: new Date(currentYear - 1, 11, 31, 23, 59, 59),
      };
    }

    const where = {
      ...dateFilter,
      user: {
        companyId,
        userName: {
          contains: userName,
        },
      },
    };

    // Get paginated leave data
    const data = await this.prisma.leave.findMany({
      where,
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        leaveType: true,
        totalLeaveDay: true,
        user: {
          select: {
            userName: true,
            userInfo: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        id: 'desc',
      },
    });

    // Count total matching records
    const totalCount = await this.prisma.leave.count({ where });

    return {
      data,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  async getLeaveById(id: string): Promise<{
    leave: DetailedLeaveResponse;
    appliedBy: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
  }> {
    const leave = await this.prisma.leave.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        leaveType: true,
        totalLeaveDay: true,
        reason: true,
        appliedAt: true,
        approvedRejectedAt: true,
        adminNote: true,
        days: {
          select: {
            id: true,
            date: true,
            leaveType: true,
            leaveId: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            userInfo: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!leave) {
      throw new NotFoundException(`Leave with ID ${id} not found.`);
    }

    const { user, ...leaveData } = leave;

    return {
      leave: leaveData,
      appliedBy: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.userInfo?.name ?? '',
      },
    };
  }

  async updateLeaveStatus(id: string, status: LeaveStatus, adminNote?: string) {
    const leave = await this.prisma.leave.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!leave) throw new NotFoundException('Leave request not found');
    if (!leave.totalLeaveDay || leave.totalLeaveDay <= 0) {
      throw new BadRequestException('Invalid leave day count');
    }

    const currentStatus = leave.status;
    const isUnpaidLeave = leave.leaveType === LeaveType.UNPAID_LEAVE;

    let updatedLeave;

    // If status is changing from APPROVED to something else → refund if not unpaid
    if (
      currentStatus === LeaveStatus.APPROVED &&
      status !== LeaveStatus.APPROVED
    ) {
      if (isUnpaidLeave) {
        updatedLeave = await this.prisma.leave.update({
          where: { id: leave.id },
          data: { status, adminNote, approvedRejectedAt: new Date() },
        });
      } else {
        const [leaveResult] = await this.prisma.$transaction([
          this.prisma.leave.update({
            where: { id: leave.id },
            data: { status, adminNote, approvedRejectedAt: new Date() },
          }),
          this.prisma.user.update({
            where: { id: leave.userId },
            data: {
              totalLeaveDays: { increment: leave.totalLeaveDay },
            },
          }),
        ]);
        updatedLeave = leaveResult;
      }
    }
    // If changing to APPROVED from non-approved → subtract leave if not unpaid
    else if (status === LeaveStatus.APPROVED) {
      if (!isUnpaidLeave && leave.user.totalLeaveDays < leave.totalLeaveDay) {
        throw new BadRequestException('Insufficient leave balance');
      }

      const transactionItems: any[] = [
        this.prisma.leave.update({
          where: { id: leave.id },
          data: {
            status: LeaveStatus.APPROVED,
            adminNote,
            approvedRejectedAt: new Date(),
          },
        }),
      ];

      if (!isUnpaidLeave) {
        transactionItems.push(
          this.prisma.user.update({
            where: { id: leave.userId },
            data: { totalLeaveDays: { decrement: leave.totalLeaveDay } },
          }),
        );
      }

      const [leaveResult] = await this.prisma.$transaction(transactionItems);
      updatedLeave = leaveResult;
    }
    // All other status changes (no balance change)
    else {
      updatedLeave = await this.prisma.leave.update({
        where: { id: leave.id },
        data: { status, adminNote, approvedRejectedAt: new Date() },
      });
    }

    // ✅ Fetch full leave with user for notification
    const fullLeave = await this.prisma.leave.findUnique({
      where: { id: updatedLeave.id },
      include: {
        days: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            userInfo: { select: { name: true } },
          },
        },
      },
    });

    // ✅ Send complete leave details to frontend
    this.notificationGateway.notifyLeaveStatusUpdate(fullLeave);

    return updatedLeave;
  }
}
