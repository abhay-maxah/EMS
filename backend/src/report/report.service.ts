import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report-dto';
import { Report } from '@prisma/client'; // Import Prisma types

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new report (punch-in).
   * @param userId The ID of the user creating the report.
   * @param createReportDto Data for creating the report.
   * @returns The newly created report.
   */
  async create(
    userId: string,
    createReportDto: CreateReportDto,
  ): Promise<Report> {
    // ✅ Check if the user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );

    const currentHour = now.getHours();

    // ✅ Check if the user is on an approved full-day leave
    const approvedLeave = await this.prisma.leave.findFirst({
      where: {
        userId: userId,
        status: 'APPROVED',
        startDate: { lte: endOfToday },
        endDate: { gte: startOfToday },
      },
    });
    if (approvedLeave) {
      const leaveDay = await this.prisma.leaveDay.findFirst({
        where: {
          leaveId: approvedLeave.id,
        },
      });

      if (leaveDay) {
        switch (leaveDay.leaveType) {
          case 'FULL_DAY':
            throw new BadRequestException(
              'You are on full-day leave today. Cannot punch in.',
            );

          case 'FIRST_HALF':
            if (currentHour < 13) {
              throw new BadRequestException(
                'You are on first-half leave. Cannot punch in before 1 PM.',
              );
            }
            break;

          case 'SECOND_HALF':
            if (currentHour >= 13) {
              throw new BadRequestException(
                'You are on second-half leave. Cannot punch in after 1 PM.',
              );
            }
            break;

          case 'NONE':
          default:
            // No restriction
            break;
        }
      } else {
        // ✅ If no LeaveDay entry, fallback to check if it's a full-day leave span
        const isSingleDayLeave =
          approvedLeave.startDate.getTime() ===
          approvedLeave.endDate?.getTime();

        if (
          isSingleDayLeave ||
          (!approvedLeave.endDate && approvedLeave.startDate)
        ) {
          throw new BadRequestException(
            'You are on full-day leave today. Cannot punch in.',
          );
        }
        // ✅ If it's a multi-day leave without a specific LeaveDay entry for today, allow it
      }
    }
    // ✅ Check for an existing open report (no punchOut) for the user
    const existingOpenReport = await this.prisma.report.findFirst({
      where: {
        userId: userId,
        punchOut: null,
      },
    });

    if (existingOpenReport) {
      throw new BadRequestException(
        'You already have an open punch-in. Please punch out first.',
      );
    }

    // ✅ Create punch-in report
    return this.prisma.report.create({
      data: {
        userId: userId,
        punchIn: createReportDto.punchIn || new Date(),
        note: createReportDto.note,
      },
    });
  }

  private subtractTimes(totalSeconds: number, worked: string): string {
    const [wH, wM, wS] = worked.split(':').map(Number);

    const workedSeconds = wH * 3600 + wM * 60 + wS;
    let breakSeconds = totalSeconds - workedSeconds;
    if (breakSeconds < 0) breakSeconds = 0;

    const hours = Math.floor(breakSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((breakSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (breakSeconds % 60).toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  async punchOut(
    userId: string,
    updateReportDto: UpdateReportDto,
  ): Promise<Report> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const openReport = await this.prisma.report.findFirst({
      where: {
        userId: userId,
        punchOut: null,
      },
    });

    if (!openReport) {
      throw new BadRequestException(
        'No open punch-in found to punch out from.',
      );
    }

    const punchOutTime = updateReportDto.punchOut || new Date();

    // Total duration in seconds
    const totalDurationSeconds = Math.floor(
      (new Date(punchOutTime).getTime() -
        new Date(openReport.punchIn).getTime()) /
        1000,
    );

    // Calculate BreakTime
    const breakTime = this.subtractTimes(
      totalDurationSeconds,
      updateReportDto.totalWorkingHours,
    );

    return this.prisma.report.update({
      where: { id: openReport.id },
      data: {
        punchOut: punchOutTime,
        totalWorkingHours: updateReportDto.totalWorkingHours,
        BreakTime: breakTime,
        note: updateReportDto.note,
      },
    });
  }
  // Finds all reports. (Admin only)
  async findAll(
    page = 1,
    limit = 10,
    name = 'All',
    companyId: string,
    startDate?: Date,
  ): Promise<{
    data: any[];
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      user: {
        companyId,
        ...(name !== 'All' &&
          name.trim() !== '' && {
            userName: {
              contains: name
            },
          }),
      },
      ...(startDate && {
        createdAt: {
          gte: startDate,
        },
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          BreakTime: true,
          userId: true,
          punchIn: true,
          punchOut: true,
          totalWorkingHours: true,
          note: true,
          createdAt: true,
          user: {
            select: {
              email: true,
              userName: true,
              companyId: true,
              userInfo: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.report.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((item) => ({
      id: item.id,
      breakTime: item.BreakTime,
      userId: item.userId,
      punchIn: item.punchIn,
      punchOut: item.punchOut,
      totalWorkingHours: item.totalWorkingHours,
      note: item.note,
      email: item.user?.email || null,
      userName: item.user?.userName || null,
      name: item.user?.userInfo?.name || null,
    }));

    return {
      data: mappedData,
      totalPages,
      currentPage: page,
    };
  }

  async findMyReports(
    userId: string,
    page = 1,
    limit = 10,
    startDate?: Date,
  ): Promise<{
    data: any[];
    totalPages: number;
    currentPage: number;
  }> {
    const skip = (page - 1) * limit;

    const dateFilter = startDate
      ? {
          createdAt: {
            gte: startDate,
          },
        }
      : {};

    const [data, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({
        where: {
          userId,
          ...dateFilter,
        },
        skip,
        take: limit,
        select: {
          id: true,
          punchIn: true,
          BreakTime: true,
          punchOut: true,
          totalWorkingHours: true,
          note: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.report.count({
        where: {
          userId,
          ...dateFilter,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      totalPages,
      currentPage: page,
    };
  }
}
