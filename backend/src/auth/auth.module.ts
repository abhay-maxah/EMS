import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule, // AuthService needs UserService to find/create users
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to inject ConfigService
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' }, // Token expiration time
      }),
      inject: [ConfigService], // Inject ConfigService
    }),
  ],
  providers: [AuthService, JwtStrategy], // JwtStrategy needs to be provided
  controllers: [AuthController],
  exports: [AuthService], // Export AuthService if needed by other modules
})
export class AuthModule {}
