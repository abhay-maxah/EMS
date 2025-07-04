import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsString()
  @IsOptional()
  role?: string = 'user'; // default is user

  @IsString()
  @IsOptional()
  companyId?: string; // optional for admin, required for user

  @IsString()
  @IsOptional()
  createdById?: string;
}

export class LoginDto {
  @IsNotEmpty({ message: 'Email or Username is required' })
  @IsString()
  credential: string; // Accepts email or username

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  password: string;
}
