import { Exclude } from 'class-transformer';
import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ example: 'admin-001' })
  id: string;

  @ApiProperty({ example: 'admin@careflow.com' })
  email: string;

  @ApiProperty({ example: 'Admin User' })
  displayName: string;

  @ApiProperty({ example: 'ADMIN' })
  role: string;

  @ApiPropertyOptional({ example: true })
  mustChangePassword?: boolean;

  @ApiPropertyOptional({ example: 'FEMALE' })
  gender?: string;

  @ApiPropertyOptional({ example: '2000-01-15', type: String, format: 'date' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'Cardiology' })
  specialization?: string;

  @ApiPropertyOptional({ example: 'Emergency' })
  department?: string;

  @ApiHideProperty()
  @Exclude()
  passwordHash?: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiPropertyOptional({ example: 'Login successful' })
  message?: string;

  @ApiPropertyOptional({ example: true })
  mustChangePassword?: boolean;

  @ApiProperty({ type: AuthResponseDto })
  user: AuthResponseDto;
}

export class TokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiPropertyOptional({ example: 'Token refreshed successfully' })
  message?: string;
}
