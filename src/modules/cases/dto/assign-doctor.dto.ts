import { IsEnum, IsUUID } from 'class-validator';
import { CaseDoctorRole } from '@prisma/client';

export class AssignDoctorDto {
  @IsUUID()
  doctorId: string;

  @IsEnum(CaseDoctorRole)
  role: CaseDoctorRole;
}