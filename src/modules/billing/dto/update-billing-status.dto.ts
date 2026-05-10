import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingStatus } from '@prisma/client';

export class UpdateBillingStatusDto {
  @ApiProperty({
    description: 'New billing status',
    enum: BillingStatus,
    example: BillingStatus.PAID,
  })
  @IsEnum(BillingStatus)
  status: BillingStatus;
}