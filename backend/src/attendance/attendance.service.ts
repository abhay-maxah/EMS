import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Leave, LeaveDay } from '@prisma/client';

export interface TeamStatusParams {
  team?: string;
  subteam?: string;
  date?: string;
  companyId: string;
}

type UserWithLeave = User & {
  userInfo: { name: string } | null;
  leaves: (Leave & { days: LeaveDay[] })[];
};

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async getTeamStatus(params: TeamStatusParams) {
    const { team, subteam, date, companyId } = params;
    const targetDate = date ? new Date(date) : new Date();
    const targetDateString = targetDate.toISOString().split('T')[0];

    const tomorrowDate = new Date(targetDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowDateString = tomorrowDate.toISOString().split('T')[0];

    const users: UserWithLeave[] = await this.prisma.user.findMany({
      where: {
        companyId,
        ...(team && { team }),
        ...(subteam && { subteam }),
      },
      include: {
        userInfo: true,
        leaves: {
          where: {
            status: 'APPROVED',
            days: {
              some: {
                date: {
                  in: [
                    new Date(targetDateString),
                    new Date(tomorrowDateString),
                  ],
                },
              },
            },
          },
          include: {
            days: true,
          },
        },
      },
    });

    const generateStatus = (user: UserWithLeave, dateStr: string): string => {
      const leaveDay = user.leaves
        .flatMap((leave) => leave.days)
        .find((d) => d.date.toISOString().split('T')[0] === dateStr);

      if (leaveDay) {
        if (leaveDay.leaveType === 'FULL_DAY') return 'Full Day';
        if (leaveDay.leaveType === 'FIRST_HALF') return 'First Half';
        if (leaveDay.leaveType === 'SECOND_HALF') return 'Second Half';
      }
      return 'Present';
    };

    const response = users.map((user) => ({
      name: user.userInfo?.name,
      team: user.team,
      subteam: user.subteam,
      today: generateStatus(user, targetDateString),
      tomorrow: generateStatus(user, tomorrowDateString),
    }));
    return response;
  }
}
