import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@ApiTags('patients')
@ApiCookieAuth('accessToken')
@Controller('api/v1/patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Post('quick-register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Quick register a new patient' })
  @ApiResponse({ status: 201, description: 'Patient registered successfully' })
  async quickRegister() {
    // TODO: Implement quick registration
  }

  @Post(':patientId/link-account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PATIENT')
  @ApiOperation({ summary: 'Link an account to a patient profile' })
  @ApiResponse({ status: 200, description: 'Account linked successfully' })
  async linkAccount(@Param('patientId') patientId: string) {
    // TODO: Implement link account
  }

  @Get(':patientId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a patient profile' })
  @ApiResponse({ status: 200, description: 'Patient profile' })
  async getProfile(@Param('patientId') patientId: string) {
    // TODO: Implement get profile
  }

  @Put(':patientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PATIENT', 'ADMIN')
  @ApiOperation({ summary: 'Update a patient profile' })
  @ApiResponse({ status: 200, description: 'Patient profile updated successfully' })
  async updateProfile(@Param('patientId') patientId: string) {
    // TODO: Implement update profile
  }

  @Get(':patientId/medical-records')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List patient medical records' })
  @ApiResponse({ status: 200, description: 'Medical records list' })
  async getMedicalRecords(@Param('patientId') patientId: string) {
    // TODO: Implement get medical records
  }

  @Post(':patientId/medical-records')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE', 'ADMIN')
  @ApiOperation({ summary: 'Create a patient medical record' })
  @ApiResponse({ status: 201, description: 'Medical record created successfully' })
  async createMedicalRecord(@Param('patientId') patientId: string) {
    // TODO: Implement create medical record
  }

  @Put(':patientId/medical-records/:recordId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Update a patient medical record' })
  @ApiResponse({ status: 200, description: 'Medical record updated successfully' })
  async updateMedicalRecord(
    @Param('patientId') patientId: string,
    @Param('recordId') recordId: string,
  ) {
    // TODO: Implement update medical record
  }
}
