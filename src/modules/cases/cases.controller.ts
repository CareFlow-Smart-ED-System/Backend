import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { AdministerMedicationDto } from './dto/administer-medication.dto';
import { ListCasesQueryDto } from './dto/list-cases.query';
import { CaseStatus } from '@prisma/client';
import { UserRole } from '@prisma/client';

@ApiTags('cases')
@ApiCookieAuth('accessToken')
@Controller('api/v1/cases')
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'RECEPTIONIST')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new emergency case' })
  @ApiBody({ type: CreateCaseDto })
  @ApiResponse({
    status: 201,
    description: 'Case created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Emergency case created successfully' },
        caseId: { type: 'string' },
        patientId: { type: 'string' },
        status: { type: 'string', example: 'WAITING' },
        arrivalTime: { type: 'string', format: 'date-time' },
      },
    },
  })
  async createCase(@Body() dto: CreateCaseDto) {
    return this.casesService.createCase(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE', 'ADMIN')
  @ApiOperation({ summary: 'Get active cases' })
  @ApiQuery({ name: 'status', required: false, enum: CaseStatus })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Cases list',
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
              caseId: { type: 'string' },
              patientId: { type: 'string' },
              patientName: { type: 'string' },
              status: { type: 'string' },
              severity: { type: 'string', nullable: true },
              arrivalTime: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async listCases(
    @CurrentUser() user: any,
    @Query() query: ListCasesQueryDto,
  ) {
    return this.casesService.getCases(
      user,
      query.status,
      Number(query.page ?? 1),
      Number(query.limit ?? 20),
    );
  }

  @Get(':caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE', 'ADMIN')
  @ApiOperation({ summary: 'Get case details' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiResponse({
    status: 200,
    description: 'Case details retrieved',
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string' },
        patientId: { type: 'string' },
        patientName: { type: 'string' },
        status: { type: 'string' },
        arrivalTime: { type: 'string', format: 'date-time' },
        assignedDoctor: { type: 'object', nullable: true },
        triage: { type: 'object', nullable: true },
      },
    },
  })
  async getCaseDetails(@Param('caseId') caseId: string, @CurrentUser() user: any) {
    return this.casesService.getCaseById(caseId, user);
  }

  @Get(':caseId/timeline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE', 'ADMIN')
  @ApiOperation({ summary: 'Get case timeline' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiResponse({
    status: 200,
    description: 'Case timeline retrieved',
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string' },
        total: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              performedBy: { type: 'string' },
              details: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getCaseTimeline(@Param('caseId') caseId: string) {
    return this.casesService.getCaseTimeline(caseId);
  }

  @Patch(':caseId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Update case status' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiBody({ type: UpdateCaseStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Case status updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Case status updated successfully' },
        caseId: { type: 'string' },
        status: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async updateCaseStatus(
    @Param('caseId') caseId: string,
    @Body() dto: UpdateCaseStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.casesService.updateCaseStatus(caseId, dto, user);
  }

  @Get(':caseId/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get discharge summary for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiResponse({
    status: 200,
    description: 'Discharge summary retrieved',
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string' },
        patientId: { type: 'string' },
        patientName: { type: 'string' },
        finalDiagnosis: { type: 'string', nullable: true },
        treatmentSummary: { type: 'string', nullable: true },
        medications: { type: 'array' },
        dischargeRecommendation: { type: 'string', nullable: true },
        dischargedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getDischargeSummary(
    @Param('caseId') caseId: string,
    @CurrentUser() user: any,
  ) {
    return this.casesService.getDischargeSummary(caseId, user);
  }

  @Post(':caseId/doctors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.NURSE)
  @HttpCode(201)
  @ApiOperation({ summary: 'Assign a doctor to a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiBody({ type: AssignDoctorDto })
  @ApiResponse({
    status: 201,
    description: 'Doctor assigned successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Doctor assigned successfully' },
        caseId: { type: 'string' },
        doctorId: { type: 'string' },
        role: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Case or doctor not found' })
  async assignDoctor(
    @Param('caseId') caseId: string,
    @Body() dto: AssignDoctorDto,
    @CurrentUser() user: any,
  ) {
    return this.casesService.assignDoctor(caseId, dto, user);
  }

  @Post(':caseId/medications/administrations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NURSE)
  @HttpCode(200)
  @ApiOperation({ summary: 'Administer a prescribed medication to patient' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiBody({ type: AdministerMedicationDto })
  @ApiResponse({
    status: 200,
    description: 'Medication administration recorded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Medication administration recorded' },
        data: {
          type: 'object',
          properties: {
            caseId: { type: 'string' },
            medicationId: { type: 'string' },
            administeredBy: { type: 'string' },
            administeredAt: { type: 'string', example: '2025-05-04' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Medication does not belong to this case' })
  @ApiResponse({ status: 404, description: 'Case or medication not found' })
  async administerMedication(
    @Param('caseId') caseId: string,
    @Body() dto: AdministerMedicationDto,
    @CurrentUser() user: any,
  ) {
    return this.casesService.administerMedication(caseId, dto, user);
  }
}
