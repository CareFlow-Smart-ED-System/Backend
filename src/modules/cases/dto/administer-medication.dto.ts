import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdministerMedicationDto {
  @ApiProperty({ example: 'uuid', description: 'The medication/prescription ID' })
  @IsString()
  @IsUUID()
  medicationId: string;
}
