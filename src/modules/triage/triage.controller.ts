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
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TriageService } from './triage.service';
import { CreateTriageDto } from './dto/create-triage.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('triage')
@ApiCookieAuth('accessToken')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/cases/:caseId/triage')
export class TriageController {
  constructor(private readonly triageService: TriageService) {}

  @Post()
  @Roles(UserRole.NURSE)
  @ApiOperation({ summary: 'Create a triage assessment for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiBody({ type: CreateTriageDto })
  @ApiResponse({
    status: 201,
    description: 'Triage assessment created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Triage recorded successfully' },
        triageId: { type: 'string' },
        caseId: { type: 'string' },
        severity: { type: 'string' },
        triageTime: { type: 'string', format: 'date-time' },
      },
    },
  })
  createTriage(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Body() dto: CreateTriageDto,
    @Request() req,
  ) {
    return this.triageService.createTriage(caseId, dto, req.user);
  }

  @Get()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get the latest triage assessment for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiResponse({
    status: 200,
    description: 'Latest triage assessment retrieved',
    schema: {
      type: 'object',
      properties: {
        triageId: { type: 'string' },
        caseId: { type: 'string' },
        severity: { type: 'string' },
        temperature: { type: 'number', nullable: true },
        systolic: { type: 'number', nullable: true },
        diastolic: { type: 'number', nullable: true },
        heartRate: { type: 'number', nullable: true },
        oxygenSaturation: { type: 'number', nullable: true },
        respiratoryRate: { type: 'number', nullable: true },
        nurseId: { type: 'string' },
        triageTime: { type: 'string', format: 'date-time' },
      },
    },
  })
  getLatestTriage(@Param('caseId', ParseUUIDPipe) caseId: string) {
    return this.triageService.getLatestTriage(caseId);
  }

  @Get('history')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get triage assessment history for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Triage history retrieved',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              triageId: { type: 'string' },
              caseId: { type: 'string' },
              severity: { type: 'string', example: 'CRITICAL' },
              temperature: { type: 'number', nullable: true, example: 39.5 },
              systolic: { type: 'number', nullable: true, example: 140 },
              diastolic: { type: 'number', nullable: true, example: 90 },
              heartRate: { type: 'number', nullable: true, example: 118 },
              oxygenSaturation: { type: 'number', nullable: true, example: 89 },
              respiratoryRate: { type: 'number', nullable: true, example: 26 },
              nurseId: { type: 'string' },
              triageTime: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  getHistory(
    @Param('caseId', ParseUUIDPipe) caseId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.triageService.getTriageHistory(caseId, Number(page), Number(limit));
  }
}