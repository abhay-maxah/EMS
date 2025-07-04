import { IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateReportDto {
  // punchIn is optional as the service can default to new Date()
  @IsOptional()
  @IsDateString({}, { message: 'punchIn must be a valid date string.' })
  punchIn?: Date;

  @IsOptional()
  @IsString({ message: 'Note must be a string.' })
  note?: string;
}
