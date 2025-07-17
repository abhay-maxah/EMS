import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto, LeaveDayDto } from './dto/create-leave-dto';
import { Leave, LeaveStatus, LeaveType, User } from '@prisma/client';
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
  constructor(private prisma: PrismaService) {}
  //applyLeave (admin,user)
  async create(userId: string, createLeaveDto: CreateLeaveDto): Promise<Leave> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // Destructure the DTO to separate `days` and other fields
    const { startDate, endDate, totalLeaveDay, days, ...rest } = createLeaveDto;

    // Convert date strings from DTO to Date objects for Prisma
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (parsedStartDate > parsedEndDate) {
      throw new BadRequestException('Start date cannot be after end date.');
    }

    if (!days || days.length === 0) {
      throw new BadRequestException('At least one leave day must be provided.');
    }

    // Frontend handles totalLeaveDay calculation, so just validate its presence and value
    if (!totalLeaveDay || totalLeaveDay <= 0) {
      throw new BadRequestException(
        'Total leave day must be a positive number.',
      );
    }

    // Check against user's remaining leave balance
    if (totalLeaveDay > user.totalLeaveDays) {
      throw new BadRequestException(
        `Insufficient leave balance. You only have ${user.totalLeaveDays} day(s) remaining.`,
      );
    }

    // Prepare the LeaveDay records for nested creation
    // Map each LeaveDayDto to the format expected by Prisma's createMany for LeaveDay
    const leaveDaysToCreate = days.map((day: LeaveDayDto) => ({
      date: new Date(day.date), // Convert the date string to a Date object
      leaveType: day.dayType, // Use the DayType enum
    }));

    // Create the main Leave record and its associated LeaveDay records
    // using Prisma's nested write for the 'days' relation.
    const newLeave = await this.prisma.leave.create({
      data: {
        userId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        totalLeaveDay,
        ...rest, // This includes leaveType and reason
        appliedAt: new Date(),
        status: LeaveStatus.PENDING,
        // Nested write for the 'days' relation
        days: {
          createMany: {
            // Use createMany to insert multiple LeaveDay records efficiently
            data: leaveDaysToCreate,
            skipDuplicates: true, // Optional: useful if you want to prevent duplicate date/leaveId, though @@unique in schema handles this
          },
        },
      },
      // You might want to include the 'days' relation in the returned object
      // so the client immediately gets the full picture of the created leave.
      include: {
        days: true,
      },
    });

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
    let dateFilter: { startDate?: any } = {};
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

    // Combined filter: companyId, optional userName, and date
    const where = {
      ...dateFilter,
      user: {
        companyId,
        ...(userName ? { userName: { equals: userName } } : {}),
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

    // If status is changing from APPROVED to something else → refund if not unpaid
    if (
      currentStatus === LeaveStatus.APPROVED &&
      status !== LeaveStatus.APPROVED
    ) {
      if (isUnpaidLeave) {
        return await this.prisma.leave.update({
          where: { id: leave.id },
          data: {
            status,
            adminNote,
            approvedRejectedAt: new Date(),
          },
        });
      }

      const [updatedLeave] = await this.prisma.$transaction([
        this.prisma.leave.update({
          where: { id: leave.id },
          data: {
            status,
            adminNote,
            approvedRejectedAt: new Date(),
          },
        }),
        this.prisma.user.update({
          where: { id: leave.userId },
          data: {
            totalLeaveDays: {
              increment: leave.totalLeaveDay,
            },
          },
        }),
      ]);

      return updatedLeave;
    }

    // If changing to APPROVED from non-approved → subtract leave if not unpaid
    if (status === LeaveStatus.APPROVED) {
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
            data: {
              totalLeaveDays: {
                decrement: leave.totalLeaveDay,
              },
            },
          }),
        );
      }

      const [updatedLeave] = await this.prisma.$transaction(transactionItems);
      return updatedLeave;
    }

    // All other status changes (e.g., REJECTED -> PENDING), no balance change
    return await this.prisma.leave.update({
      where: { id: leave.id },
      data: {
        status,
        adminNote,
        approvedRejectedAt: new Date(),
      },
    });
  }
}
