import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdministerMedicationDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  medicationId: string;
}