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
  ): Promise<{ info: any; leave: PartialLeave[] }> {
    const info = await this.getUserInfo(currentUser.id);
    const leave = await this.prisma.leave.findMany({
      where: { userId: currentUser.id },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        leaveType: true,
        totalLeaveDay: true,
      },
    });
    return { info, leave };
  }
  async getAllLeavForAdmin(companyId: string): Promise<
    {
      id: number;
      startDate: Date;
      endDate: Date | null;
      status: string;
      leaveType: string;
      totalLeaveDay: number | null;
      user: {
        userInfo: {
          name: string;
        } | null;
      };
    }[]
  > {
    const leaves = await this.prisma.leave.findMany({
      where: {
        user: {
          companyId: companyId, // ✅ Filter by companyId through the user
        },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        status: true,
        leaveType: true,
        totalLeaveDay: true,
        user: {
          select: {
            userInfo: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return leaves;
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

    // If the status is already APPROVED and changing to something else → refund leave
    if (
      currentStatus === LeaveStatus.APPROVED &&
      status !== LeaveStatus.APPROVED
    ) {
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

    // If changing to APPROVED from non-approved → check balance & subtract leave
    if (status === LeaveStatus.APPROVED) {
      if (leave.user.totalLeaveDays < leave.totalLeaveDay) {
        throw new BadRequestException('Insufficient leave balance');
      }

      const [updatedLeave] = await this.prisma.$transaction([
        this.prisma.leave.update({
          where: { id: leave.id },
          data: {
            status: LeaveStatus.APPROVED,
            adminNote,
            approvedRejectedAt: new Date(),
          },
        }),
        this.prisma.user.update({
          where: { id: leave.userId },
          data: {
            totalLeaveDays: {
              decrement: leave.totalLeaveDay,
            },
          },
        }),
      ]);

      return updatedLeave;
    }

    // All other normal updates (no change in leave balance)
    const updatedLeave = await this.prisma.leave.update({
      where: { id: leave.id },
      data: {
        status,
        adminNote,
        approvedRejectedAt: new Date(),
      },
    });

    return updatedLeave;
  }
}
