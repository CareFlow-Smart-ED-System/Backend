import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class PrescribeMedicationDto {
  @ApiProperty({ example: 'Paracetamol' })
  @IsString()
  name: string;
  @ApiProperty({ example: '500mg every 6 hours' })
  @IsString()
  @MinLength(1)
  dosage: string;
}