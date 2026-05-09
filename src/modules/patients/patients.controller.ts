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
