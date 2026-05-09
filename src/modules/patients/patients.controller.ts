import {
  Controller,
  Post,
  Get,
  Patch,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
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
@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  /**
   * Quick patient registration for emergency arrivals
   * POST /api/v1/patients/quick-register
   * Who uses it: Receptionist, Nurse
   */
  @Post('quick-register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Quick register a new patient' })
  @ApiResponse({ status: 201, description: 'Patient registered successfully' })
  async quickRegister(@Body() quickRegisterDto: QuickRegisterDto) {
    const result = await this.patientsService.quickRegister(quickRegisterDto);
    return {
      message: 'Patient registered successfully',
      ...result,
    };
  }

  /**
   * Link user account to existing patient profile
   * POST /api/v1/patients/{patientId}/link-account
   * Who uses it: Receptionist, Admin
   */
  @Post(':patientId/link-account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN')
  @HttpCode(201)
  @ApiOperation({ summary: 'Link an account to a patient profile' })
  @ApiResponse({ status: 200, description: 'Account linked successfully' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiBody({ type: LinkAccountDto })
  async linkAccount(
    @Param('patientId') patientId: string,
    @Body() linkAccountDto: LinkAccountDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.patientsService.linkAccount(
      patientId,
      linkAccountDto,
    );
    return {
      message: 'User account successfully linked to patient',
      ...result,
    };
  }

  /**
   * Get patient profile information
   * GET /api/v1/patients/{patientId}
   * Who uses it: Doctor, Nurse, Receptionist, Admin
   * Notes: Doctor can only access if patient has case assigned to them
   */
  @Get(':patientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE', 'RECEPTIONIST', 'ADMIN')
  @ApiOperation({ summary: 'Get a patient profile' })
  @ApiResponse({ status: 200, description: 'Patient profile' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  async getProfile(
    @Param('patientId') patientId: string,
    @CurrentUser() user: any,
  ) {
    return await this.patientsService.getProfile(patientId, user);
  }

  /**
   * Update patient profile
   * PATCH /api/v1/patients/{patientId}
   * Who uses it: Receptionist, Admin
   */
  @Patch(':patientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a patient profile' })
  @ApiResponse({ status: 200, description: 'Patient profile updated successfully' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiBody({ type: UpdatePatientDto })
  async updateProfile(
    @Param('patientId') patientId: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    await this.patientsService.updateProfile(patientId, updatePatientDto);
    return {
      message: 'Patient profile updated successfully',
      patientId: patientId,
    };
  }

  /**
   * Get medical records for a specific case
   * GET /api/v1/cases/{caseId}/medical-records
   * Who uses it: Doctor, Nurse
   * Pagination: page, limit
   */
  @Get('cases/:caseId/medical-records')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'List patient medical records' })
  @ApiResponse({ status: 200, description: 'Medical records list' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  async getMedicalRecords(
    @Param('caseId') caseId: string,
    @Query() queryDto: GetMedicalRecordsQueryDto,
    @CurrentUser() user: any,
  ) {
    return await this.patientsService.getMedicalRecords(
      caseId,
      queryDto,
      user,
    );
  }

  /**
   * Create medical record for a case
   * POST /api/v1/cases/{caseId}/medical-records
   * Who uses it: Doctor
   */
  @Post('cases/:caseId/medical-records')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a patient medical record' })
  @ApiResponse({ status: 201, description: 'Medical record created successfully' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiBody({ type: CreateMedicalRecordDto })
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

  /**
   * Update medical record
   * PATCH /api/v1/cases/{caseId}/medical-records/{recordId}
   * Who uses it: Doctor
   * Note: Doctor can only update records for assigned cases
   */
  @Patch('cases/:caseId/medical-records/:recordId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a patient medical record' })
  @ApiResponse({ status: 200, description: 'Medical record updated successfully' })
  @ApiParam({ name: 'caseId', description: 'Case ID' })
  @ApiParam({ name: 'recordId', description: 'Medical Record ID' })
  @ApiBody({ type: UpdateMedicalRecordDto })
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
      recordId: recordId,
      caseId: caseId,
    };
  }
}
