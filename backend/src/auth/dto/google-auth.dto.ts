import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsEmail({}, { message: 'A valid email address is required.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'User name is required.' })
  name: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  role?: 'MOTHER' | 'CAREGIVER';

  @IsOptional()
  @IsString()
  joiningCode?: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  idToken?: string;
}

export class ValidateJoiningCodeDto {
  @IsString()
  @IsNotEmpty({ message: 'Caregiver joining code is required.' })
  code: string;
}
