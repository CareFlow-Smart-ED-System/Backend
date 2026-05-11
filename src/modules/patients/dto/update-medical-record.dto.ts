import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMedicalRecordDto {
  @ApiPropertyOptional({ example: 'Acute appendicitis with mild infection' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ example: 'Patient scheduled for immediate surgery' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'Type 2 Diabetes' })
  @IsOptional()
  @IsString()
  chronicDiseases?: string;

  @ApiPropertyOptional({ example: 'Hypertension' })
  @IsOptional()
  @IsString()
  familyHistory?: string;
}
