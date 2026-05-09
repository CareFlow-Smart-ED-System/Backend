import { IsEnum, IsOptional, IsNumberString } from 'class-validator';
import { CaseStatus } from '@prisma/client';

export class ListCasesQueryDto {
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
