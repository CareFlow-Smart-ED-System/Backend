import { IsEnum } from 'class-validator';
import { BillingStatus } from '@prisma/client';

export class UpdateBillingStatusDto {
  @IsEnum(BillingStatus)
  status: BillingStatus;
}