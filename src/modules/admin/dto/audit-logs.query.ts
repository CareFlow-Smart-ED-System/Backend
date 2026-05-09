import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAuditLogsQueryDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({ example: 'CASE_STATUS_UPDATED' })
  @IsOptional()
  @IsString()
  actionType?: string;

  @ApiPropertyOptional({ example: 'user-id-uuid' })
  @IsOptional()
  @IsString()
  userId?: string;
}
