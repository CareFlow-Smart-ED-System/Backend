import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { TriageService } from './triage.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@Controller('api/v1/triage')
export class TriageController {
  constructor(private triageService: TriageService) {}

  @Post(':caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'ADMIN')
  @HttpCode(201)
  async createTriage(@Param('caseId') caseId: string) {
    // TODO: Implement create triage (immutable)
  }

  @Get(':caseId/latest')
  @UseGuards(JwtAuthGuard)
  async getLatestTriage(@Param('caseId') caseId: string) {
    // TODO: Implement get latest triage
  }

  @Get(':caseId/history')
  @UseGuards(JwtAuthGuard)
  async getTriageHistory(@Param('caseId') caseId: string) {
    // TODO: Implement get triage history
  }
}
