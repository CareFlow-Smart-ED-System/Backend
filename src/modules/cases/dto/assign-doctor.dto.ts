import { IsEnum, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CaseDoctorRole } from '@prisma/client';

export class AssignDoctorDto {
  @ApiProperty({
    description: 'The doctor ID (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsString()
  @IsUUID()
  doctorId: string;

  @ApiProperty({
    description: 'The role of the doctor in this case',
    example: 'PRIMARY',
    enum: CaseDoctorRole,
  })
  @IsEnum(CaseDoctorRole)
  role: CaseDoctorRole;
}