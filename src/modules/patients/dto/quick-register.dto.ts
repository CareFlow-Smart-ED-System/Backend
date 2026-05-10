import {
  IsString,
  IsDateString,
  IsEnum,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Gender } from '@prisma/client';

export class QuickRegisterDto {
  @ApiProperty({ example: 'Salma' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Ahmed' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '2003-08-15', type: String, format: 'date' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'FEMALE', enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: '+201012345678' })
  @IsPhoneNumber()
  phone: string;
}