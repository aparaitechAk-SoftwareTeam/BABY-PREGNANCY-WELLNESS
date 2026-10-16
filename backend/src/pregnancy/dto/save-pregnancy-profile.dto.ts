import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SavePregnancyProfileDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  calculationMethod?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentWeek?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentDay?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  trimester?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  daysRemaining?: number;

  @IsOptional()
  @IsString()
  pregnancyType?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  heightFt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentWeight?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  prePregnancyWeight?: number;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  motherAge?: number;

  @IsOptional()
  @IsString()
  doctorName?: string;

  @IsOptional()
  @IsString()
  hospitalName?: string;

  @IsOptional()
  @IsString()
  doctorPhone?: string;

  @IsOptional()
  @IsString()
  nextAppointmentDate?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @IsOptional()
  @IsString()
  preferredUnits?: string;
}
