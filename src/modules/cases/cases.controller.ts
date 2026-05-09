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
import { CasesService } from './cases.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@ApiTags('cases')
@ApiCookieAuth('accessToken')
@Controller('api/v1/cases')
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new emergency case' })
  @ApiResponse({ status: 201, description: 'Case created successfully' })
  async createCase() {
    // TODO: Implement create case
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List cases' })
  @ApiResponse({ status: 200, description: 'Cases list' })
  async listCases() {
    // TODO: Implement list cases
  }

  @Get(':caseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get case details' })
  @ApiResponse({ status: 200, description: 'Case details' })
  async getCaseDetails(@Param('caseId') caseId: string) {
    // TODO: Implement get case details
  }

  @Get(':caseId/timeline')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get case timeline' })
  @ApiResponse({ status: 200, description: 'Case timeline' })
  async getCaseTimeline(@Param('caseId') caseId: string) {
    // TODO: Implement get case timeline
  }

  @Put(':caseId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE', 'ADMIN')
  @ApiOperation({ summary: 'Update case status' })
  @ApiResponse({ status: 200, description: 'Case status updated successfully' })
  async updateCaseStatus(@Param('caseId') caseId: string) {
    // TODO: Implement update case status
  }

  @Post(':caseId/discharge-summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Create a discharge summary' })
  @ApiResponse({ status: 201, description: 'Discharge summary created successfully' })
  async createDischargeSummary(@Param('caseId') caseId: string) {
    // TODO: Implement create discharge summary
  }

  @Post(':caseId/assign-doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Assign a doctor to a case' })
  @ApiResponse({ status: 200, description: 'Doctor assigned successfully' })
  async assignDoctor(@Param('caseId') caseId: string) {
    // TODO: Implement assign doctor
  }
}
