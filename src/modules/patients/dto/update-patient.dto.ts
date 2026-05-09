import { IsOptional, IsString, IsDateString, IsEnum, IsPhoneNumber } from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}