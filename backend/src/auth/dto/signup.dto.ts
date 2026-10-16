import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';

export enum Role {
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  MOTHER = 'MOTHER',
  CAREGIVER = 'CAREGIVER',
  PARTNER = 'PARTNER',
  FAMILY = 'FAMILY',
}

export enum OtpType {
  VERIFICATION = 'VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

export class SignupDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/i, {
    message: 'Email must be a valid @gmail.com address',
  })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(16, { message: 'Password cannot exceed 16 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/, {
    message:
      'Password must be 8-16 characters and include at least one uppercase letter, one lowercase letter, one number, and one symbol',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be MOTHER, CAREGIVER, PARTNER, FAMILY, ADMIN, or SUPPORT' })
  role?: Role;
}
