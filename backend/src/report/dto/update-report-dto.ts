import { PartialType } from '@nestjs/mapped-types';
import { CreateReportDto } from './create-report.dto';
import { IsOptional, IsString, IsDateString, Matches } from 'class-validator';

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @IsOptional()
  @IsDateString({}, { message: 'punchOut must be a valid date string.' })
  punchOut?: Date;

  @IsOptional()
  @IsString({ message: 'Note must be a string.' })
  note?: string;

  @IsString({ message: 'totalWorkingHours must be a string.' })
  @Matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/, {
    message: 'totalWorkingHours must be in HH:MM:SS format.',
  })
  totalWorkingHours: string;
}
