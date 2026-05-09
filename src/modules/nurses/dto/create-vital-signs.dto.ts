import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVitalSignsDto {
  @ApiProperty({ example: 37.8 })
  @IsNumber()
  temperature: number;

  @ApiProperty({ example: 130 })
  @IsNumber()
  systolic: number;

  @ApiProperty({ example: 85 })
  @IsNumber()
  diastolic: number;

  @ApiProperty({ example: 98 })
  @IsNumber()
  heartRate: number;

  @ApiProperty({ example: 98 })
  @IsNumber()
  oxygenSaturation: number;

  @ApiProperty({ example: 18 })
  @IsNumber()
  respiratoryRate: number;
}