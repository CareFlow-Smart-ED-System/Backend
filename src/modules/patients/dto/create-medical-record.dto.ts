import { IsOptional, IsString } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsString()
  diagnosis: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  chronicDiseases?: string;

  @IsOptional()
  @IsString()
  familyHistory?: string;
}
