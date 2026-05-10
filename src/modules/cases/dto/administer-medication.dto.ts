import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdministerMedicationDto {
  @ApiProperty({
    description: 'The medication prescription ID (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsString()
  @IsUUID()
  medicationId: string;
}
