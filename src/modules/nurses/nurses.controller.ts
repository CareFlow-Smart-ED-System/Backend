import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NursesService } from './nurses.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@ApiTags('nurses')
@ApiCookieAuth('accessToken')
@Controller('api/v1/nurses')
export class NursesController {
  constructor(private nursesService: NursesService) {}

  @Post('vital-signs/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'ADMIN')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create vital signs for a case' })
  @ApiResponse({ status: 201, description: 'Vital signs recorded successfully' })
  async createVitalSigns(@Param('caseId') caseId: string) {
    // TODO: Implement create vital signs
  }

  @Get('vital-signs/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get vital signs for a case' })
  @ApiResponse({ status: 200, description: 'Vital signs list' })
  async getVitalSigns(@Param('caseId') caseId: string) {
    // TODO: Implement get vital signs
  }

  @Post('medications/:medicationId/administer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'ADMIN')
  @HttpCode(201)
  @ApiOperation({ summary: 'Mark a medication as administered' })
  @ApiResponse({ status: 201, description: 'Medication administered successfully' })
  async administerMedication(@Param('medicationId') medicationId: string) {
    // TODO: Implement administer medication
  }

  @Post('notes/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'ADMIN')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a clinical note for a case' })
  @ApiResponse({ status: 201, description: 'Clinical note created successfully' })
  async createClinicalNote(@Param('caseId') caseId: string) {
    // TODO: Implement create clinical note
  }

  @Get('notes/:caseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get clinical notes for a case' })
  @ApiResponse({ status: 200, description: 'Clinical notes list' })
  async getClinicalNotes(@Param('caseId') caseId: string) {
    // TODO: Implement get clinical notes
  }
}
