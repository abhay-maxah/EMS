import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Override the canActivate method to check for public routes.
   * If a route is marked with @Public(), this guard will allow access without JWT.
   * @param context The execution context.
   * @returns True if the route is public or if authentication succeeds, false otherwise.
   */
  canActivate(context: ExecutionContext) {
    // Check if the handler or class is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Allow access to public routes without authentication
    }

    // If not public, proceed with JWT authentication
    return super.canActivate(context);
  }

  /**
   * Override handleRequest to customize authentication failure behavior.
   * @param err Error thrown by the Passport strategy.
   * @param user User object returned by the strategy.
   * @param info Additional info from the strategy.
   * @returns The authenticated user object.
   * @throws UnauthorizedException if authentication fails.
   */
  handleRequest(err: any, user: any) {
    // You can throw an exception based on error or user status
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
