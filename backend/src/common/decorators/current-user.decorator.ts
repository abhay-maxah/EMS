import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export interface CurrentUserDto {
  id: string;
  email: string;
  role: string;
  companyId: string | null;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserDto => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user as Partial<CurrentUserDto> | undefined;

    // Validate presence and types
    if (
      !user ||
      typeof user.id !== 'string' ||
      typeof user.email !== 'string' ||
      typeof user.role !== 'string'
    ) {
      throw new UnauthorizedException(
        'User not found in request or missing required fields.',
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: typeof user.companyId === 'string' ? user.companyId : null,
    };
  },
);
