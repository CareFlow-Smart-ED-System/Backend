import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TriageService } from './triage.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@ApiTags('triage')
@ApiCookieAuth('accessToken')
@Controller('api/v1/triage')
export class TriageController {
  constructor(private triageService: TriageService) {}

  @Post(':caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'ADMIN')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a triage assessment' })
  @ApiResponse({ status: 201, description: 'Triage created successfully' })
  async createTriage(@Param('caseId') caseId: string) {
    // TODO: Implement create triage (immutable)
  }

  @Get(':caseId/latest')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the latest triage assessment' })
  @ApiResponse({ status: 200, description: 'Latest triage assessment' })
  async getLatestTriage(@Param('caseId') caseId: string) {
    // TODO: Implement get latest triage
  }

  @Get(':caseId/history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get triage history' })
  @ApiResponse({ status: 200, description: 'Triage history' })
  async getTriageHistory(@Param('caseId') caseId: string) {
    // TODO: Implement get triage history
  }
}
