import {
  IsString,
  IsDateString,
  IsEnum,
  IsPhoneNumber,
} from 'class-validator';

 enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class UpdatePatientDto {
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