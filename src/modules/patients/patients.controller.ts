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
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import {
  QuickRegisterDto,
  LinkAccountDto,
  UpdatePatientDto,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  GetMedicalRecordsQueryDto,
} from './dto';

@ApiTags('patients')
@ApiCookieAuth('accessToken')
@Controller('api/v1/patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Post('quick-register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Quick register a new patient' })
  @ApiBody({ type: QuickRegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Patient registered successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Patient registered successfully' },
        patientId: { type: 'string' },
        firstName: { type: 'string', example: 'Salma' },
        lastName: { type: 'string', example: 'Ahmed' },
        displayName: { type: 'string', example: 'Salma Ahmed' },
        age: { type: 'number', example: 22 },
        gender: { type: 'string', example: 'FEMALE' },
        phone: { type: 'string', example: '+201012345678' },
      },
    },
  })
  async quickRegister(@Body() quickRegisterDto: QuickRegisterDto) {
    const result = await this.patientsService.quickRegister(quickRegisterDto);
    return {
      message: 'Patient registered successfully',
      ...result,
    };
  }

  @Post(':patientId/link-account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @HttpCode(201)
  @ApiOperation({ summary: 'Link an account to a patient profile' })
  @ApiParam({ name: 'patientId', type: 'string', description: 'The patient ID' })
  @ApiBody({ type: LinkAccountDto })
  @ApiResponse({
    status: 201,
    description: 'Account linked successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User account successfully linked to patient' },
        userId: { type: 'string' },
        patientId: { type: 'string' },
        role: { type: 'string', example: 'PATIENT' },
      },
    },
  })
  async linkAccount(
    @Param('patientId') patientId: string,
    @Body() linkAccountDto: LinkAccountDto,
  ) {
    const result = await this.patientsService.linkAccount(patientId, linkAccountDto);
    return {
      message: 'User account successfully linked to patient',
      ...result,
    };
  }

  @Get(':patientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a patient profile' })
  @ApiParam({ name: 'patientId', type: 'string', description: 'The patient ID' })
  @ApiResponse({
    status: 200,
    description: 'Patient profile retrieved',
    schema: {
      type: 'object',
      properties: {
        patientId: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        displayName: { type: 'string' },
        age: { type: 'number' },
        gender: { type: 'string' },
        phone: { type: 'string' },
      },
    },
  })
  async getProfile(
    @Param('patientId') patientId: string,
    @CurrentUser() user: any,
  ) {
    return await this.patientsService.getProfile(patientId, user);
  }

  @Patch(':patientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RECEPTIONIST, UserRole.ADMIN)
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a patient profile' })
  @ApiParam({ name: 'patientId', type: 'string', description: 'The patient ID' })
  @ApiBody({ type: UpdatePatientDto })
  @ApiResponse({
    status: 200,
    description: 'Patient profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Patient profile updated successfully' },
        patientId: { type: 'string' },
      },
    },
  })
  async updateProfile(
    @Param('patientId') patientId: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    await this.patientsService.updateProfile(patientId, updatePatientDto);
    return {
      message: 'Patient profile updated successfully',
      patientId,
    };
  }

  // ─── Medical Records ───────────────────────────────────────────────────────

  @Get('cases/:caseId/medical-records')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({ summary: 'Get medical records for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Records per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Medical records list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        patientId: { type: 'string', example: 'uuid' },
        total: { type: 'number', example: 5 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 1 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              recordId: { type: 'string', example: 'uuid' },
              caseId: { type: 'string', example: 'uuid' },
              diagnosis: { type: 'string', example: 'Acute appendicitis' },
              notes: { type: 'string', example: 'Patient presented with severe right lower quadrant pain' },
              chronicDiseases: { type: 'string', example: 'Type 2 Diabetes', nullable: true },
              familyHistory: { type: 'string', example: 'Hypertension, Stroke', nullable: true },
              createdAt: { type: 'string', format: 'date-time', example: '2026-05-10T12:00:00Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2026-05-10T12:00:00Z' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Case not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized access to this case' })
  async getMedicalRecords(
    @Param('caseId') caseId: string,
    @Query() queryDto: GetMedicalRecordsQueryDto,
    @CurrentUser() user: any,
  ) {
    return await this.patientsService.getMedicalRecords(caseId, queryDto, user);
  }

  @Post('cases/:caseId/medical-records')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a medical record for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiBody({ type: CreateMedicalRecordDto })
  @ApiResponse({
    status: 201,
    description: 'Medical record created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Medical record created successfully' },
        recordId: { type: 'string' },
        patientId: { type: 'string' },
        caseId: { type: 'string' },
      },
    },
  })
  async createMedicalRecord(
    @Param('caseId') caseId: string,
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.patientsService.createMedicalRecord(
      caseId,
      createMedicalRecordDto,
      user,
    );
    return {
      message: 'Medical record created successfully',
      ...result,
    };
  }

  @Patch('cases/:caseId/medical-records/:recordId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a medical record' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiParam({ name: 'recordId', type: 'string', description: 'The medical record ID' })
  @ApiBody({ type: UpdateMedicalRecordDto })
  @ApiResponse({
    status: 200,
    description: 'Medical record updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Medical record updated successfully' },
        recordId: { type: 'string' },
        caseId: { type: 'string' },
      },
    },
  })
  async updateMedicalRecord(
    @Param('caseId') caseId: string,
    @Param('recordId') recordId: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @CurrentUser() user: any,
  ) {
    await this.patientsService.updateMedicalRecord(
      caseId,
      recordId,
      updateMedicalRecordDto,
      user,
    );
    return {
      message: 'Medical record updated successfully',
      recordId,
      caseId,
    };
  }
}