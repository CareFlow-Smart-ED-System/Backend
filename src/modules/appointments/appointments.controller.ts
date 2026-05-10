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
import {
  ApiTags,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { AppointmentStatus, UserRole } from '@prisma/client';

@ApiTags('appointments')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Book a new appointment' })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({
    status: 201,
    description: 'Appointment booked successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Appointment booked successfully' },
        appointmentId: { type: 'string', example: 'uuid' },
        patientId: { type: 'string', example: 'uuid' },
        doctorId: { type: 'string', example: 'uuid' },
        date: { type: 'string', format: 'date-time' },
        status: { type: 'string', example: 'SCHEDULED' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input or appointment already exists' })
  @ApiResponse({ status: 404, description: 'Patient or doctor not found' })
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(dto);
  }

  @Get()
  @Roles(UserRole.DOCTOR, UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get list of appointments with filtering and pagination' })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus, description: 'Filter by appointment status' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'List of appointments retrieved',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              appointmentId: { type: 'string' },
              patientId: { type: 'string' },
              patientName: { type: 'string' },
              doctorId: { type: 'string' },
              doctorName: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              status: { type: 'string' },
            },
          },
        },
      },
    },
  })
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

  @Patch(':appointmentId')
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiParam({ name: 'appointmentId', type: 'string', description: 'The appointment ID' })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiResponse({
    status: 200,
    description: 'Appointment updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Appointment updated successfully' },
        appointmentId: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  updateAppointment(
    @Param('appointmentId', ParseUUIDPipe) appointmentId: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.updateAppointment(appointmentId, dto);
  }
}