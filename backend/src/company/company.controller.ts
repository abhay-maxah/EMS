import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/shared/constants/roles';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  create(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser() CurrentUser: User,
  ) {
    return this.companyService.createCompany(createCompanyDto, CurrentUser.id);
  }
  @Get('list')
  getCompanys() {
    return this.companyService.getCompanys();
  }
  @Get('employe-list/:id')
  getCompanyBYListOfEmployee(@Param('id') id: string) {
    return this.companyService.getCompanyBYListOfEmployee(id);
  }

  @Get(':id')
  getCompanyById(@Param('id') id: string) {
    return this.companyService.getCompanyById(id);
  }

  @Patch(':id')
  updateCompany(@Param('id') id: string, @Body() updateData: any) {
    return this.companyService.updateCompany(id, updateData);
  }
}
