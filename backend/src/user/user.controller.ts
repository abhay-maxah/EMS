import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../shared/constants/roles';
import {
  CurrentUser,
  CurrentUserDto,
} from '../common/decorators/current-user.decorator';
import { User } from '@prisma/client';
@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves all users.
   * Only accessible by users with the 'ADMIN' role.
   * Returns a list of all users.
   */
  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@CurrentUser() currentUser: User) {
    if (!currentUser.companyId) {
      throw new BadRequestException('User does not belong to a company.');
    }
    const users = await this.userService.findAll(currentUser.companyId);
    return {
      message: 'Successfully retrieved all users.',
      data: users,
      count: users.length,
    };
  }

  /**
   * Retrieves a single user by their ID.
   * Only accessible by users with the 'ADMIN' role.
   * @param id The ID of the user to retrieve.
   * @returns The user with the specified ID.
   */
  @Get('me')
  async findMyProfile(@CurrentUser() user: CurrentUserDto) {
    const fullUserProfile = await this.userService.findOne(user.id);

    return {
      message: 'Successfully retrieved your profile.',
      data: fullUserProfile,
    };
  }

  @Get('all-users')
  @Roles(UserRole.ADMIN)
  async getAllUsersWithRoleUser(@CurrentUser() currentUser: User) {
    if (!currentUser.companyId) {
      throw new BadRequestException('User does not belong to a company.');
    }
    return this.userService.getAllUsersWithRoleUser(currentUser.companyId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findUserById(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    return {
      message: `Successfully retrieved user with ID ${id}.`,
      data: user,
    };
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.USER)
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException(
        'You are not authorized to update this user profile.',
      );
    }

    const updatedUser = await this.userService.updateUserWithInfo(
      id,
      updateUserDto,
    );

    return {
      message: `User with ID ${id} updated successfully.`,
      data: updatedUser,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Returns 204 No Content on successful deletion
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string) {
    await this.userService.remove(id);
    // No content is returned for 204, but you could optionally log or send a custom success status
    // if not using @HttpCode(HttpStatus.NO_CONTENT)
  }
}
