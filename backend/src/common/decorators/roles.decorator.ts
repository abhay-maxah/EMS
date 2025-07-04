import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../shared/constants/roles';

export const ROLES_KEY = 'roles';

/**
 * Custom decorator to assign required roles to a route or controller.
 *
 * Usage:
 * @Roles(UserRole.ADMIN, UserRole.MANAGER)
 * @Get('admin-manager-dashboard')
 * getDashboard() { ... }
 *
 * The RolesGuard will check if the authenticated user's role matches any of the
 * roles specified in this decorator.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
