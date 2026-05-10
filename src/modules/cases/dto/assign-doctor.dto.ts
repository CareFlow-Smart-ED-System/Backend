import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CaseDoctorRole } from '@prisma/client';

export class AssignDoctorDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsString()
  doctorId: string;

  @ApiProperty({ example: 'PRIMARY', enum: CaseDoctorRole })
  @IsEnum(CaseDoctorRole)
  role: CaseDoctorRole;
}