import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditActionType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAuditLogDto {
  @ApiProperty({ enum: AuditActionType })
  @IsEnum(AuditActionType)
  actionType: AuditActionType;

  @ApiProperty({ type: 'string', description: 'ID of the user performing the action' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ type: 'string', description: 'Optional target entity ID (case, user, etc.)' })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiPropertyOptional({ type: 'string', description: 'Optional details about the action' })
  @IsOptional()
  @IsString()
  details?: string;
}
