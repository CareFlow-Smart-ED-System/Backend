import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('api/v1/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('PATIENT', 'RECEPTIONIST', 'ADMIN')
  @HttpCode(201)
  async bookAppointment() {
    // TODO: Implement book appointment
  }

  @Get()
  async listAppointments(@CurrentUser() user: any) {
    // TODO: Implement list appointments
  }

  @Put(':appointmentId')
  @UseGuards(RolesGuard)
  @Roles('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN')
  async updateAppointment(@Param('appointmentId') appointmentId: string) {
    // TODO: Implement update appointment
  }
}
