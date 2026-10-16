import { IsEmail, IsString, IsNotEmpty, Matches } from 'class-validator';

export class SigninDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/i, {
    message: 'Email must be a valid @gmail.com address',
  })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
