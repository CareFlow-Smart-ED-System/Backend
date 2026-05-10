import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { AppointmentStatus, UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // POST /api/v1/appointments — Receptionist, Admin
  @Post()
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(dto);
  }

  // GET /api/v1/appointments — Doctor, Receptionist, Admin
  @Get()
  @Roles(UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.ADMIN)
  getAppointments(
    @Request() req,
    @Query('status') status?: AppointmentStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.appointmentsService.getAppointments(
      req.user,
      status,
      Number(page),
      Number(limit),
    );
  }

  // PATCH /api/v1/appointments/:id — Receptionist, Admin
  @Patch(':appointmentId')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  updateAppointment(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.updateAppointment(appointmentId, dto);
  }
}