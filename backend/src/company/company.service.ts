import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new company and link it to a user with transaction handling.
   */
  async createCompany(createCompanyDto: CreateCompanyDto, userId: string) {
    // Check if the company name already exists
    const existingCompany = await this.prisma.company.findFirst({
      where: { name: createCompanyDto.name },
    });

    if (existingCompany) {
      throw new BadRequestException('Company with this name already exists');
    }

    // Check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Perform both operations in a transaction
    const [company] = await this.prisma.$transaction([
      this.prisma.company.create({
        data: {
          ...createCompanyDto,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          companyId: undefined, // Ensure this is correctly handled
        },
      }),
    ]);

    // Update user with the newly created companyId (after getting it)
    await this.prisma.user.update({
      where: { id: userId },
      data: { companyId: company.id },
    });

    return {
      message: 'Company created successfully',
      company,
    };
  }

  /**
   * Get company by ID with associated users.
   */
  async getCompanyBYListOfEmployee(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            email: true,
            userName: true,
            team: true,
            subteam: true,
            role: true,
          },
        },
      },
    });
    const count = await this.prisma.user.count({ where: { companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return { company, count };
  }
  async getCompanyById(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return { company };
  }

  /**
   * Update a company by ID.
   */
  async updateCompany(
    companyId: string,
    updateData: Partial<CreateCompanyDto>,
  ) {
    const existingCompany = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!existingCompany) {
      throw new NotFoundException('Company not found');
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });
  }
  async getCompanys() {
    const company = await this.prisma.company.findMany();
    return company;
  }
}
