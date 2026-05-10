import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
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
  @ApiBody({ schema: { type: 'object', properties: { doctorId: { type: 'string' }, appointmentDate: { type: 'string', format: 'date-time' }, reason: { type: 'string' } }, required: ['doctorId', 'appointmentDate'] } })
  @ApiResponse({ status: 201, description: 'Appointment booked successfully' })
  async bookAppointment() {
    // TODO: Implement book appointment
  }

  @Get()
  @ApiOperation({ summary: 'List appointments for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)' })
  @ApiResponse({ status: 200, description: 'Appointments list retrieved' })
  async listAppointments(@CurrentUser() user: any) {
    // TODO: Implement list appointments
  }

  @Put(':appointmentId')
  @UseGuards(RolesGuard)
  @Roles('PATIENT', 'DOCTOR', 'RECEPTIONIST', 'ADMIN')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiParam({ name: 'appointmentId', type: 'string', description: 'The appointment ID' })
  @ApiBody({ schema: { type: 'object', properties: { appointmentDate: { type: 'string', format: 'date-time' }, reason: { type: 'string' }, status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] } } } })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  async updateAppointment(@Param('appointmentId') appointmentId: string) {
    // TODO: Implement update appointment
  }
}
