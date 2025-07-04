import { Module } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule

@Module({
  imports: [PrismaModule], // Make PrismaService available
  controllers: [LeaveController],
  providers: [LeaveService],
})
export class LeaveModule {}
