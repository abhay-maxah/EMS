import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attandenceService: AttendanceService) {}
  @Get()
  async getTeamStatus(
    @CurrentUser() currentUser: User,
    @Query('team') team?: string,
    @Query('subteam') subteam?: string,
    @Query('date') date?: string,
  ) {
    if (!currentUser.companyId) {
      return { message: 'You are not a member of any company.' };
    }
    return this.attandenceService.getTeamStatus({
      team,
      subteam,
      date,
      companyId: currentUser.companyId,
    });
  }
}
