import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSymptomLogDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsArray()
  @IsString({ each: true })
  symptoms: string[];

  @IsOptional()
  @IsString()
  severity?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;
}
