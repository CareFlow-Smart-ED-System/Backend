import {
  IsString,
  IsDateString,
  IsEnum,
  IsPhoneNumber,
} from 'class-validator';

import { Gender } from '@prisma/client';

export class QuickRegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsPhoneNumber()
  phone: string;
}