import {
  IsDateString,
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  ValidateNested, // To validate nested objects/arrays
  IsArray, // To validate arrays
  ArrayMinSize, // To ensure at least one day is provided
} from 'class-validator';
import { Type } from 'class-transformer'; // For transforming plain objects to class instances
import { LeaveType, DayType } from '@prisma/client'; // Import Prisma enums

// DTO for individual leave days
export class LeaveDayDto {
  @IsDateString(
    {},
    { message: 'Date must be a valid date string (YYYY-MM-DD).' },
  )
  @IsNotEmpty({ message: 'Date cannot be empty for a leave day.' })
  date: string; // Use string for date as it comes from frontend, convert to Date later if needed

  @IsEnum(DayType, {
    message: `Day type must be one of: ${Object.values(DayType).join(', ')}.`,
  })
  @IsNotEmpty({ message: 'Day type cannot be empty for a leave day.' })
  dayType: DayType;
}

export class CreateLeaveDto {
  @IsEnum(LeaveType, {
    message: `Leave type must be one of: ${Object.values(LeaveType).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Leave type cannot be empty.' })
  leaveType: LeaveType;

  @IsString({ message: 'Reason must be a string.' })
  @IsNotEmpty({ message: 'Reason cannot be empty.' })
  reason: string;

  // This field will still be sent from the frontend as per your previous clarification
  @IsNumber({}, { message: 'Total leave day must be a number.' })
  @IsNotEmpty({ message: 'Total leave day cannot be empty.' }) // Make it required since frontend calculates it
  totalLeaveDay: number;

  // New fields to capture the detailed day information
  @IsArray({ message: 'Leave days must be an array.' })
  @ArrayMinSize(1, { message: 'At least one leave day must be provided.' })
  @ValidateNested({ each: true }) // Validate each item in the array
  @Type(() => LeaveDayDto) // Important for class-transformer to properly validate nested objects
  days: LeaveDayDto[];

  // You might still want to include startDate and endDate for overall range reference,
  // even if the detailed 'days' array is the source of truth.
  // They would represent the min/max dates from the 'days' array.
  // Make them optional if they are derived from 'days' on the frontend
  // or if they are simply a convenience for display.
  @IsDateString({}, { message: 'Start date must be a valid date string.' })
  @IsNotEmpty({ message: 'Start date cannot be empty.' })
  startDate: string; // Use string as it comes from frontend

  @IsDateString({}, { message: 'End date must be a valid date string.' })
  @IsNotEmpty({ message: 'End date cannot be empty.' })
  endDate: string; // Use string as it comes from frontend
}
