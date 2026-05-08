import { IsString, IsOptional } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  actionType: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsString()
  details?: string;
}
