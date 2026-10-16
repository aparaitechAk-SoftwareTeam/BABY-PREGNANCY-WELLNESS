import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export enum Role {
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  MOTHER = 'MOTHER',
  CAREGIVER = 'CAREGIVER',
  PARTNER = 'PARTNER',
  FAMILY = 'FAMILY',
}

export class SignupDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be MOTHER, CAREGIVER, PARTNER, FAMILY, ADMIN, or SUPPORT' })
  role?: Role;
}
