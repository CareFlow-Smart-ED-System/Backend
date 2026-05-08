import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { NursesService } from './nurses.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@Controller('api/v1/nurses')
export class NursesController {
  constructor(private nursesService: NursesService) {}

  @Post('vital-signs/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'ADMIN')
  @HttpCode(201)
  async createVitalSigns(@Param('caseId') caseId: string) {
    // TODO: Implement create vital signs
  }

  @Get('vital-signs/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'DOCTOR', 'ADMIN')
  async getVitalSigns(@Param('caseId') caseId: string) {
    // TODO: Implement get vital signs
  }

  @Post('medications/:medicationId/administer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'ADMIN')
  @HttpCode(201)
  async administerMedication(@Param('medicationId') medicationId: string) {
    // TODO: Implement administer medication
  }

  @Post('notes/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'ADMIN')
  @HttpCode(201)
  async createClinicalNote(@Param('caseId') caseId: string) {
    // TODO: Implement create clinical note
  }

  @Get('notes/:caseId')
  @UseGuards(JwtAuthGuard)
  async getClinicalNotes(@Param('caseId') caseId: string) {
    // TODO: Implement get clinical notes
  }
}
