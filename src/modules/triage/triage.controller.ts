import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TriageService } from './triage.service';
import { CreateTriageDto } from './dto/create-triage.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/cases/:caseId/triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  // POST /api/v1/cases/:caseId/triage — Nurse only
  @Post()
  @Roles(UserRole.NURSE)
  createTriage(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() dto: CreateTriageDto,
    @Request() req,
  ) {
    return this.triageService.createTriage(caseId, dto, req.user);
  }

  // GET /api/v1/cases/:caseId/triage — Doctor, Nurse, Admin
  @Get()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  getLatestTriage(@Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.triageService.getLatestTriage(caseId);
  }

  // GET /api/v1/cases/:caseId/triage/history — Doctor, Nurse, Admin
  @Get('history')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  getHistory(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.triageService.getTriageHistory(caseId, Number(page), Number(limit));
  }
}