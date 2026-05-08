import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateStaffUserDto {
  @IsEmail()
  email: string;

  @IsString()
  displayName: string;

  @IsEnum(['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'])
  role: UserRole;

  @IsString()
  @MinLength(8)
  temporaryPassword: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(8)
  newTemporaryPassword: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  displayName: string;
  role: string;
  mustChangePassword: boolean;
  createdAt: Date;
  updatedAt: Date;
}
