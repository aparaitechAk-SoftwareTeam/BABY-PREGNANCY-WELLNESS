import { IsEmail, IsString, IsNotEmpty, Matches } from 'class-validator';

export class SigninDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
