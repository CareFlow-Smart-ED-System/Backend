import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,       
  Query, 
  HttpCode,
  DefaultValuePipe,   // ← add
  ParseIntPipe,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PrescribeMedicationDto } from './dto/prescribe-medication.dto';

@ApiTags('doctors')
@ApiCookieAuth('accessToken')

@Controller('api/v1/doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all doctors' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Doctors list retrieved successfully',
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
              doctorId: { type: 'string' },
              displayName: { type: 'string' },
              specialization: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
  })
  async listDoctors(
   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
   @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
) {
  return this.doctorsService.listDoctors(page, limit);
}


  @Get('me/cases')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Get assigned cases for current doctor' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Doctor assigned cases retrieved',
    schema: {
      type: 'object',
      properties: {
        doctorId: { type: 'string' },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              caseId: { type: 'string' },
              patientName: { type: 'string' },
              patientId: { type: 'string' },
              severity: { type: 'string', nullable: true },
              priorityScore: { type: 'number' },
              status: { type: 'string' },
              arrivalTime: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getAssignedCases(
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.doctorsService.getAssignedCases(user, page, limit, status);
  }

  @Get('cases/:caseId/lab-results')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Get lab results for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Lab results list retrieved',
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string' },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              result: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              status: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getLabResults(@Param('caseId') caseId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,) {
    return this.doctorsService.getLabResults(caseId, page, limit);
  }

  @Get('cases/:caseId/imaging-reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Get imaging reports for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Imaging reports list retrieved',
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string' },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              report: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              status: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getImagingReports( @Param('caseId') caseId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,) {
    return this.doctorsService.getImagingReports(caseId, page, limit);
  }

  @Post('cases/:caseId/medications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @HttpCode(201)
  @ApiOperation({ summary: 'Prescribe medication for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiBody({ type: PrescribeMedicationDto })
  @ApiResponse({
    status: 201,
    description: 'Medication prescribed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Medication prescribed successfully' },
        medication: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            caseId: { type: 'string' },
            name: { type: 'string' },
            dosage: { type: 'string' },
            prescribedBy: { type: 'string' },
          },
        },
      },
    },
  })
  async prescribeMedication(@Param('caseId') caseId: string,
    @Body() dto: PrescribeMedicationDto,      
    @CurrentUser() user: any,) {
    return this.doctorsService.prescribeMedication(caseId, user, dto);
  }
}
