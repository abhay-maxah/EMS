import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaveResetService {
  private readonly logger = new Logger(LeaveResetService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Runs every 6 months at midnight on the 1st day
  @Cron('0 0 1 */6 *')
  async handleCron() {
    this.logger.log('Running leave reset cron job...');

    const users = await this.prisma.user.findMany({
      include: { userInfo: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of the day

    const usersToUpdate = users.filter((user) => {
      const joiningDate = user.userInfo?.JoiningDate;
      if (!joiningDate) return false;

      const joining = new Date(joiningDate);
      joining.setFullYear(joining.getFullYear() + 1); // Add 1 year

      joining.setHours(0, 0, 0, 0); // Normalize

      return joining.getTime() === today.getTime();
    });

    if (usersToUpdate.length === 0) {
      this.logger.log('No users completed 1 year today.');
      return;
    }

    for (const user of usersToUpdate) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          totalLeaveDays: 18,
        },
      });

      this.logger.log(
        `Leave reset for ${user.userInfo?.name} (UserID: ${user.id})`,
      );
    }

    this.logger.log(`Leave reset completed for ${usersToUpdate.length} users.`);
  }
}
