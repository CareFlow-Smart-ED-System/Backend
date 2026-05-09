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
  @ApiProperty({ example: 'Dr. Sara Ahmed' })
  @IsString()
  displayName: string;

  @ApiProperty({ example: 'sara.ahmed@careflow.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ example: '2000-01-15', type: String, format: 'date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: 'FEMALE', enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ enum: UserRole, example: 'DOCTOR' })
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
