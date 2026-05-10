import { IsEnum, IsString } from 'class-validator';
import { CaseDoctorRole } from '@prisma/client';

export class AssignDoctorDto {
  @IsString()
  doctorId: string;

  @IsEnum(CaseDoctorRole)
  role: CaseDoctorRole;
}