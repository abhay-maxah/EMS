import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../shared/constants/roles';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LeaveStatus, User } from '@prisma/client';

@Controller('leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  applyLeave(
    @Body() createLeaveDto: CreateLeaveDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.leaveService.create(currentUser.id, createLeaveDto);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.ADMIN)
  getAllLeaves(
    @CurrentUser() currentUser: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('year') year: 'all' | 'current' | 'last' = 'all',
  ) {
    return this.leaveService.getAllLeavForUser(currentUser, {
      page: Number(page),
      limit: Number(limit),
      year,
    });
  }

  @Get('AllLeavesForAdmin')
  @Roles(UserRole.ADMIN)
  getAllLeavesForAdmin(
    @CurrentUser() currentUser: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('year') year: 'all' | 'current' | 'last' = 'all',
    @Query('userName') userName?: string,
  ) {
    if (!currentUser.companyId) {
      throw new BadRequestException('Company ID is required.');
    }

    return this.leaveService.getAllLeavForAdmin(currentUser.companyId, {
      page: Number(page),
      limit: Number(limit),
      year,
      userName,
    });
  }

  @Get(':id')
  getLeaveByID(@Param('id') id: string) {
    return this.leaveService.getLeaveById(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  updateLeaveStatus(
    @Param('id') id: string,
    @Body() body: { status: LeaveStatus; adminNote?: string },
  ) {
    return this.leaveService.updateLeaveStatus(id, body.status, body.adminNote);
  }
}
