import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportModule } from './report/report.module';
import { LeaveModule } from './leave/leave.module';
import configuration from './config/configuration';
import { validationSchema } from './config/validation-schema';
import { AttendanceModule } from './attendance/attendance.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [
    // Configure ConfigModule to load .env variables and validate them
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available globally
      load: [configuration], // Load custom configuration
      validationSchema, // Apply Joi schema for validation
      envFilePath: ['.env'], // Specify the path to your .env file
      // ignoreEnvFile: process.env.NODE_ENV === 'production', // Ignore .env in production if you use external config
    }),
    AuthModule,
    UserModule,
    PrismaModule, // Make PrismaService available throughout the application
    ReportModule,
    LeaveModule,
    AttendanceModule,
    ScheduleModule.forRoot(),
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
