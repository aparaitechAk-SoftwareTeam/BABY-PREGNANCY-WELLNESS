import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateWaterLogDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @Type(() => Number)
  @IsNumber()
  amountMl: number;

  @IsOptional()
  @IsString()
  timeStr?: string;

  @IsOptional()
  @IsString()
  label?: string;
}
