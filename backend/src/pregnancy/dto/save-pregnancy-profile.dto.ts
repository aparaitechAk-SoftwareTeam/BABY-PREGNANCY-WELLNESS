import { IsString, IsOptional, IsNumber } from 'class-validator';

export class SavePregnancyProfileDto {
  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  calculationMethod?: string;

  @IsOptional()
  @IsNumber()
  currentWeek?: number;

  @IsOptional()
  @IsNumber()
  currentDay?: number;

  @IsOptional()
  @IsNumber()
  trimester?: number;

  @IsOptional()
  @IsNumber()
  daysRemaining?: number;

  @IsOptional()
  @IsString()
  pregnancyType?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  heightFt?: string;

  @IsOptional()
  @IsNumber()
  currentWeight?: number;

  @IsOptional()
  @IsNumber()
  prePregnancyWeight?: number;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
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
