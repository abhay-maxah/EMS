import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
// Define the shape of the JWT payload
export interface JwtPayload {
  email: string;
  sub: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService, // Inject PrismaService to validate user
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request | undefined): string | null => {
          if (req && 'cookies' in req) {
            const cookies = req.cookies as Record<string, string> | undefined;
            return cookies?.['access_token'] ?? null;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Validates the JWT payload. This method is called after the token is verified.
   * @param payload The decoded JWT payload.
   * @returns The user object to be attached to the request (req.user).
   */
  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or invalid token.');
    }

    // Return the user object (or relevant parts) which will be attached to req.user
    // Make sure sensitive data like password is not returned.
    const { ...result } = user;
    return result;
  }
}
