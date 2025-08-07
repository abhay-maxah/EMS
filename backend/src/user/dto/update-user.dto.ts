// src/users/dto/update-user.dto.ts
import {
  IsOptional,
  IsString,
  IsEnum,
  Min,
  IsDateString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../shared/constants/roles';

export class UpdateUserInfoDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsDateString()
  JoiningDate?: string;

  @IsOptional()
  @IsDateString()
  DOB?: string;

  @IsOptional()
  @IsString()
  Gender?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  team?: string;

  @IsOptional()
  @IsString()
  subteam?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalLeaveDays?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserInfoDto)
  userInfo?: UpdateUserInfoDto;
}
