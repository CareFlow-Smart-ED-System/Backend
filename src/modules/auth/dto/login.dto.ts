import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@careflow.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'AdminPass123!', description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;
}
