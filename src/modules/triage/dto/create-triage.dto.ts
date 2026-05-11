import { IsEnum, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TriageSeverity } from '@prisma/client';

export class CreateTriageDto {
  @ApiProperty({ example: 'CRITICAL', enum: TriageSeverity })
  @IsEnum(TriageSeverity)
  severity: TriageSeverity;

  @ApiPropertyOptional({ example: 38.9 })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ example: 130 })
  @IsOptional()
  @IsNumber()
  @Min(40) @Max(300)
  systolic?: number;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(20) @Max(200)
  diastolic?: number;

  @ApiPropertyOptional({ example: 110 })
  @IsOptional()
  @IsNumber()
  @Min(20) @Max(300)
  heartRate?: number;

  @ApiPropertyOptional({ example: 92 })
  @IsOptional()
  @IsNumber()
  @Min(0) @Max(100)
  oxygenSaturation?: number;

  @ApiPropertyOptional({ example: 24 })
  @IsOptional()
  @IsNumber()
  @Min(0) @Max(60)
  respiratoryRate?: number;
}