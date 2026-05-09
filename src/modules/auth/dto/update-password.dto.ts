import { IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'AdminPass123!', description: 'Current password' })
  @IsString()
  @MinLength(8)
  currentPassword: string;

  @ApiProperty({ example: 'NewSecurePass123!', description: 'New password' })
  @IsString()
  @MinLength(8)
  newPassword: string;

  @ApiPropertyOptional({
    example: 'NewSecurePass123!',
    description: 'Password confirmation, use either newPasswordConfirm or confirmPassword',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  newPasswordConfirm?: string;

  @ApiPropertyOptional({
    example: 'NewSecurePass123!',
    description: 'Alternate password confirmation field supported by the API',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  confirmPassword?: string;
}
