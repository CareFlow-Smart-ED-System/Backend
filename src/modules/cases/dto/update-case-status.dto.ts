import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CaseStatus } from '@prisma/client';

export class UpdateCaseStatusDto {
  @ApiProperty({ example: 'COMPLETED', enum: CaseStatus })
  @IsEnum(CaseStatus)
  status: CaseStatus;
}