import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
type UserWithoutPassword = Omit<User, 'password' | 'subteam'>;
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string): Promise<UserWithoutPassword[]> {
    return this.prisma.user.findMany({
      where: {
        companyId: companyId, // Only return users from the same company
      },
      select: {
        id: true,
        email: true,
        role: true,
        team: true,
        userName: true,
        createdAt: true,
        updatedAt: true,
        totalLeaveDays: true,
        companyId: true,
        createdById: true,
        userInfo: true,
      },
    });
  }

  /**
   * Finds a user by ID.
   * @param id The ID of the user to find.
   * @returns The found user, or null if not found.
   */
  async findOne(id: string): Promise<UserWithoutPassword | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        team: true,
        userName: true,
        createdAt: true,
        updatedAt: true,
        totalLeaveDays: true,
        companyId: true,
        createdById: true,
        userInfo: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async getAllUsersWithRoleUser(companyId: string) {
    return this.prisma.user.findMany({
      where: {
        companyId: companyId,
      },
      select: {
        userName: true,
      },
    });
  }
  /**
   * Updates an existing user.
   * @param id The ID of the user to update.
   * @param updateUserDto Data to update the user.
   * @returns The updated user.
   */ // src/users/user.service.ts
  // src/users/user.service.ts
  async updateUserWithInfo(id: string, dto: UpdateUserDto) {
    const { userInfo, ...userFields } = dto;

    // 1. Update basic User fields
    await this.prisma.user.update({
      where: { id },
      data: userFields,
    });

    // 2. Update or create userInfo
    if (userInfo) {
      const existingInfo = await this.prisma.userInfo.findUnique({
        where: { userId: id },
      });

      if (existingInfo) {
        // Safely update with null fallback
        await this.prisma.userInfo.update({
          where: { userId: id },
          data: {
            ...(userInfo.name !== undefined && { name: userInfo.name }),
            address: userInfo.address ?? null,
            city: userInfo.city ?? null,
            state: userInfo.state ?? null,
            phoneNumber: userInfo.phoneNumber ?? null,
            Gender: userInfo.Gender ?? null,
            DOB: userInfo.DOB ? new Date(userInfo.DOB) : null,
            JoiningDate: userInfo.JoiningDate
              ? new Date(userInfo.JoiningDate)
              : null,
          },
        });
      } else {
        // Validate `name` is present before create
        if (!userInfo.name) {
          throw new BadRequestException(
            'Name is required when creating user info.',
          );
        }

        await this.prisma.userInfo.create({
          data: {
            userId: id,
            name: userInfo.name,
            address: userInfo.address ?? null,
            city: userInfo.city ?? null,
            state: userInfo.state ?? null,
            Gender: userInfo.Gender ?? null,
            phoneNumber: userInfo.phoneNumber ?? null,
            DOB: userInfo.DOB ? new Date(userInfo.DOB) : null,
            JoiningDate: userInfo.JoiningDate
              ? new Date(userInfo.JoiningDate)
              : null,
          },
        });
      }
    }

    // 3. Return updated profile with joined info
    return this.prisma.user.findUnique({
      where: { id },
      include: { userInfo: true },
    });
  }

  async remove(id: string): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
