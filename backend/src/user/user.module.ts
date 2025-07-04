import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { LeaveResetService } from '../leave/leave-reset.service';

@Module({
  providers: [UserService, LeaveResetService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
