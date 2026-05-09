import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('appointments')
@ApiCookieAuth('accessToken')
@Controller('api/v1/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('PATIENT', 'RECEPTIONIST', 'ADMIN')
  @HttpCode(201)
  @ApiOperation({ summary: 'Book a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment booked successfully' })
  async bookAppointment() {
    // TODO: Implement book appointment
  }

  @Get()
  @ApiOperation({ summary: 'List appointments for the current user' })
  @ApiResponse({ status: 200, description: 'Appointments list' })
  async listAppointments(@CurrentUser() user: any) {
    // TODO: Implement list appointments
  }

  @Put(':appointmentId')
  @UseGuards(RolesGuard)
  @Roles('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  async updateAppointment(@Param('appointmentId') appointmentId: string) {
    // TODO: Implement update appointment
  }
}
