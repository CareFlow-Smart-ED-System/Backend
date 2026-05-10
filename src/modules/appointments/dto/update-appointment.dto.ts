import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

export class UpdateAppointmentDto {
  @ApiProperty({
    description: 'New appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.COMPLETED,
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}