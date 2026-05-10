import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '@prisma/client';

export class UpdateAppointmentDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}