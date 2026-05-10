import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CaseStatus } from '@prisma/client';

export class UpdateCaseStatusDto {
  @ApiProperty({
    description: 'The new case status',
    example: CaseStatus.COMPLETED,
    enum: CaseStatus,
  })
  @IsEnum(CaseStatus)
  status: CaseStatus;
}