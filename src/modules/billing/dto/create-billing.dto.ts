import { IsNumber, IsPositive, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBillingDto {
  @ApiProperty({
    description: 'Emergency case ID (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID()
  caseId: string;

  @ApiProperty({
    description: 'Billing amount (must be positive)',
    type: 'number',
    example: 150.00,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;
}