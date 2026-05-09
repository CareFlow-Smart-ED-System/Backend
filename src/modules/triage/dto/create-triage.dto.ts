import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { TriageSeverity } from '@prisma/client';

export class CreateTriageDto {
  @IsEnum(TriageSeverity)
  severity: TriageSeverity;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(40) @Max(300)
  systolic?: number;

  @IsOptional()
  @IsNumber()
  @Min(20) @Max(200)
  diastolic?: number;

  @IsOptional()
  @IsNumber()
  @Min(20) @Max(300)
  heartRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0) @Max(100)
  oxygenSaturation?: number;

  @IsOptional()
  @IsNumber()
  @Min(0) @Max(60)
  respiratoryRate?: number;
}