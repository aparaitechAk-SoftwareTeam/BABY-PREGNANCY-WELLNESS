import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWeightLogDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @Type(() => Number)
  @IsNumber()
  weightKg: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  week?: number;

  @IsOptional()
  @IsString()
  dateStr?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
