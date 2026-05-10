import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Patient ID (UUID)',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'Doctor ID (UUID)',
    example: 'a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c',
  })
  @IsUUID()
  doctorId: string;

  @ApiProperty({
    description: 'Appointment date and time (ISO 8601 format)',
    example: '2026-05-15T09:00:00.000Z',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    description: 'Appointment status (defaults to SCHEDULED)',
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus = AppointmentStatus.SCHEDULED;
}