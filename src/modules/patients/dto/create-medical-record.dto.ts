import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMedicalRecordDto {
  @ApiProperty({ example: 'Acute appendicitis' })
  @IsString()
  diagnosis: string;

  @ApiPropertyOptional({ example: 'Patient presented with right lower quadrant pain' })
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
