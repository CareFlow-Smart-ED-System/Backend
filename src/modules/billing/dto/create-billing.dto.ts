import { IsNumber, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateBillingDto {
  @IsUUID()
  caseId: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;
}