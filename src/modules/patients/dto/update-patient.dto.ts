// update-patient.dto.ts
import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  phone?: string;
}