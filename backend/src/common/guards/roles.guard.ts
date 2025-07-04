import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../shared/constants/roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required roles metadata from the route handler or controller
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are specified, the route is accessible to any authenticated user
    if (!requiredRoles) {
      return true;
    }

    // Get the user from the request. This user object is set by JwtAuthGuard.
    const { user } = context.switchToHttp().getRequest();

    // Check if the user exists and their role is included in the required roles
    // The `user` object will be of type `User` (from Prisma), which has a `role` property.
    return user && requiredRoles.some((role) => user.role === role);
  }
}
