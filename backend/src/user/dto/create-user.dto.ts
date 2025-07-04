import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsInt({ message: 'totalLeaveDays must be an integer.' })
  @Min(0, { message: 'totalLeaveDays cannot be negative.' })
  totalLeaveDays?: number;

  @IsOptional()
  @IsString({ message: 'Team must be a string.' })
  team?: string;

  @IsOptional()
  @IsString({ message: 'Subteam must be a string.' })
  subteam?: string;

  // Optional userInfo fields during user creation
  @IsOptional()
  @IsString({ message: 'Name must be a string.' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Address must be a string.' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'City must be a string.' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'State must be a string.' })
  state?: string;

  @IsOptional()
  @IsDateString({}, { message: 'JoiningDate must be a valid date string.' })
  JoiningDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'DOB must be a valid date string.' })
  DOB?: string;

  @IsOptional()
  @IsString({ message: 'Gender must be a string.' })
  Gender?: string;
}
