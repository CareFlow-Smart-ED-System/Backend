import {
  Controller,
  Get,
  Post,
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
import { UserRole } from '@prisma/client';
import {
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto,
  GetMedicalRecordsQueryDto,
} from './dto';

@Controller('api/v1/cases')// Full path: /api/v1/cases
@UseGuards(JwtAuthGuard, RolesGuard)
export class CasesController {
  constructor(private readonly patientsService: PatientsService) {}

  /**
   * Get medical records for a specific case
   * GET /api/v1/cases/{caseId}/medical-records
   */
  @Get(':caseId/medical-records')
  @Roles(UserRole.DOCTOR, UserRole.NURSE)
  async getMedicalRecords(
    @Param('caseId') caseId: string,
    @Query() queryDto: GetMedicalRecordsQueryDto,
    @CurrentUser() user: any,
  ) {
    return await this.patientsService.getMedicalRecords(caseId, queryDto, user);
  }

  /**
   * Adds a new medical record
   * POST /api/v1/cases/{caseId}/medical-records
   */
  @Post(':caseId/medical-records')
  @Roles(UserRole.DOCTOR)
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
   * Updates a medical record
   * PATCH /api/v1/cases/{caseId}/medical-records/{recordId}
   */
  @Patch(':caseId/medical-records/:recordId')
  @Roles(UserRole.DOCTOR)
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
      recordId,
      caseId,
    };
  }
}