import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class CreateAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus = AppointmentStatus.SCHEDULED;
}