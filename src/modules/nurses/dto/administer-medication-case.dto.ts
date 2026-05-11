import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdministerMedicationCaseDto {
  @ApiProperty({ example: 'uuid', description: 'The case ID' })
  @IsString()
  @IsUUID()
  caseId: string;

  @ApiProperty({ example: 'uuid', description: 'The medication/prescription ID' })
  @IsString()
  @IsUUID()
  medicationId: string;
}
