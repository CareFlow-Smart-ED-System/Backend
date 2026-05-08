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
import { PatientsService } from './patients.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@Controller('api/v1/patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Post('quick-register')
  @HttpCode(201)
  async quickRegister() {
    // TODO: Implement quick registration
  }

  @Post(':patientId/link-account')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PATIENT')
  async linkAccount(@Param('patientId') patientId: string) {
    // TODO: Implement link account
  }

  @Get(':patientId')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Param('patientId') patientId: string) {
    // TODO: Implement get profile
  }

  @Put(':patientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PATIENT', 'ADMIN')
  async updateProfile(@Param('patientId') patientId: string) {
    // TODO: Implement update profile
  }

  @Get(':patientId/medical-records')
  @UseGuards(JwtAuthGuard)
  async getMedicalRecords(@Param('patientId') patientId: string) {
    // TODO: Implement get medical records
  }

  @Post(':patientId/medical-records')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE', 'ADMIN')
  async createMedicalRecord(@Param('patientId') patientId: string) {
    // TODO: Implement create medical record
  }

  @Put(':patientId/medical-records/:recordId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'ADMIN')
  async updateMedicalRecord(
    @Param('patientId') patientId: string,
    @Param('recordId') recordId: string,
  ) {
    // TODO: Implement update medical record
  }
}
