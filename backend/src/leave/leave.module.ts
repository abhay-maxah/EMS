import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule
import { NotificationGatewayModule } from 'src/notification-gateway/notification-gateway.module';

@Module({
  imports: [PrismaModule, NotificationGatewayModule], // Make PrismaService available
  controllers: [LeaveController],
  providers: [LeaveService],
})
export class LeaveModule {}
