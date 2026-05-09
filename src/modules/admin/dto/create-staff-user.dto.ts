import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, UserRole } from '@prisma/client';

export class CreateStaffUserDto {
  @ApiProperty({ example: 'Dr. Sara Ahmed', description: 'Full name of the staff member' })
  @IsString()
  displayName: string;

  @ApiProperty({ example: 'sara.ahmed@careflow.com', description: 'Unique staff email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8, description: 'Initial temporary password' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: '2000-01-15', type: String, format: 'date', description: 'Date of birth in YYYY-MM-DD format' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'FEMALE', enum: Gender, description: 'Optional staff gender' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ enum: UserRole, example: 'DOCTOR', description: 'Staff role to create' })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    example: 'Cardiology',
    description: 'Required when role is DOCTOR',
  })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiPropertyOptional({
    example: 'Emergency',
    description: 'Required when role is NURSE',
  })
  @IsOptional()
  @IsString()
  department?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'TempPass123!', description: 'Temporary password to assign to the user' })
  @IsString()
  @MinLength(8)
  newTemporaryPassword: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 'user-123' })
  id: string;

  @ApiProperty({ example: 'sara.ahmed@careflow.com' })
  email: string;

  @ApiProperty({ example: 'Dr. Sara Ahmed' })
  displayName: string;

  @ApiProperty({ example: 'DOCTOR' })
  role: string;

  @ApiProperty({ example: true })
  mustChangePassword: boolean;

  @ApiProperty({ example: '2026-05-09T00:00:00.000Z', type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ example: '2026-05-09T00:00:00.000Z', type: String, format: 'date-time' })
  updatedAt: Date;
}
