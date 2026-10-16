import { IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateKickSessionDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @Type(() => Number)
  @IsNumber()
  kicks: number;

  @Type(() => Number)
  @IsNumber()
  durationSeconds: number;

  @IsOptional()
  @IsBoolean()
  reachedTen?: boolean;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
