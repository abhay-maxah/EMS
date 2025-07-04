import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveDto } from './create-leave-dto';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { LeaveStatus, LeaveType } from '@prisma/client'; // Import Prisma enums

export class UpdateLeaveDto extends PartialType(CreateLeaveDto) {
  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date string.' })
  startDate?: string; // Change to string to match expected input and CreateLeaveDto

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date string.' })
  endDate?: string; // Change to string to match expected input and CreateLeaveDto

  @IsOptional()
  @IsEnum(LeaveType, {
    message: `Leave type must be one of: ${Object.values(LeaveType).join(', ')}`,
  })
  leaveType?: LeaveType;

  @IsOptional()
  @IsString({ message: 'Reason must be a string.' })
  reason?: string;

  @IsOptional()
  @IsEnum(LeaveStatus, {
    message: `Status must be one of: ${Object.values(LeaveStatus).join(', ')}`,
  })
  status?: LeaveStatus;

  @IsOptional()
  @IsString({ message: 'Admin note must be a string.' })
  adminNote?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Total leave day must be a number.' })
  totalLeaveDay?: number;
}
