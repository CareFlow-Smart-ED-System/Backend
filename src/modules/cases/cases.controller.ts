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
import { CasesService } from './cases.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@Controller('api/v1/cases')
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN')
  @HttpCode(201)
  async createCase() {
    // TODO: Implement create case
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listCases() {
    // TODO: Implement list cases
  }

  @Get(':caseId')
  @UseGuards(JwtAuthGuard)
  async getCaseDetails(@Param('caseId') caseId: string) {
    // TODO: Implement get case details
  }

  @Get(':caseId/timeline')
  @UseGuards(JwtAuthGuard)
  async getCaseTimeline(@Param('caseId') caseId: string) {
    // TODO: Implement get case timeline
  }

  @Put(':caseId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE', 'ADMIN')
  async updateCaseStatus(@Param('caseId') caseId: string) {
    // TODO: Implement update case status
  }

  @Post(':caseId/discharge-summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'ADMIN')
  async createDischargeSummary(@Param('caseId') caseId: string) {
    // TODO: Implement create discharge summary
  }

  @Post(':caseId/assign-doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECEPTIONIST')
  async assignDoctor(@Param('caseId') caseId: string) {
    // TODO: Implement assign doctor
  }
}
