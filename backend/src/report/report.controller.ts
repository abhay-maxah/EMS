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
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report-dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../shared/constants/roles';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  /**
   * Create a new report (punch-in).
   * Users can only create reports for themselves.
   * @param createReportDto The data for creating the report.
   * @param currentUser The currently authenticated user.
   * @returns The created report.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  // No @Roles needed, as any authenticated user can punch in/out for themselves
  create(
    @Body() createReportDto: CreateReportDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.reportService.create(currentUser.id, createReportDto);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  punchOut(
    @Body() updateReportDto: UpdateReportDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.reportService.punchOut(currentUser.id, updateReportDto);
  }
  /**
   * Get all reports. Restricted to ADMINs.
   * @returns An array of all reports.
   */
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '15',
    @Query('name') name: string = 'All',
    @Query('dateRange') dateRange: string = 'ALL', // default to ALL
    @CurrentUser() user: User,
  ) {
    const pageNumber = parseInt(page, 15);
    const limitNumber = parseInt(limit, 15);

    let startDate: Date | undefined;
    const now = new Date();

    switch (dateRange.toLowerCase()) {
      case '1week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1month':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3months':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'all':
      default:
        startDate = undefined;
    }
    if (!user.companyId) {
      throw new BadRequestException('Company ID is required.');
    }
    return this.reportService.findAll(
      pageNumber,
      limitNumber,
      name,
      user.companyId,
      startDate,
    );
  }
  @Get(':userId')
  async findMyReports(
    @Param('userId') userId: string,
    @Query('page') page: 1,
    @Query('limit') limit: 15,
    @Query('dateRange') dateRange: string = 'all',
  ) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    const now = new Date();

    switch (dateRange.toLowerCase()) {
      case '1week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = now;
        break;
      case '1month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        endDate = now;
        break;
      case '3months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        endDate = now;
        break;
      case 'all':
        startDate = undefined;
        endDate = undefined;
        break;
      default:
        throw new BadRequestException('Invalid dateRange value');
    }

    return this.reportService.findMyReports(
      userId,
      page,
      limit,
      startDate,
      endDate,
    );
  }
}
