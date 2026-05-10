import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  DefaultValuePipe,  
  ParseIntPipe,       
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { NursesService } from './nurses.service';
import { CreateVitalSignsDto } from './dto/create-vital-signs.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { AdministerMedicationDto } from './dto/administer-medication.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

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
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiBody({ type: CreateVitalSignsDto })
  @ApiResponse({
    status: 201,
    description: 'Vital signs recorded successfully',
    schema: { type: 'object', properties: { message: { type: 'string' }, id: { type: 'string' }, caseId: { type: 'string' }, temperature: { type: 'number', nullable: true }, systolic: { type: 'number', nullable: true }, diastolic: { type: 'number', nullable: true }, heartRate: { type: 'number', nullable: true }, oxygenSaturation: { type: 'number', nullable: true }, respiratoryRate: { type: 'number', nullable: true }, recordedBy: { type: 'string' }, timestamp: { type: 'string', format: 'date-time' } } },
  })
  async createVitalSigns(@Param('caseId') caseId: string, @Body() dto: CreateVitalSignsDto,
    @CurrentUser() user: any,
) {
    return this.nursesService.createVitalSigns(caseId, user?.nurseId ?? user?.id ?? user?.sub, dto);
  }

  @Get('vital-signs/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get vital signs for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Vital signs list retrieved',
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string' },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              temperature: { type: 'number', nullable: true },
              systolic: { type: 'number', nullable: true },
              diastolic: { type: 'number', nullable: true },
              heartRate: { type: 'number', nullable: true },
              oxygenSaturation: { type: 'number', nullable: true },
              respiratoryRate: { type: 'number', nullable: true },
              nurseId: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getVitalSigns(@Param('caseId') caseId: string,@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,) {
    return this.nursesService.getVitalSigns(caseId, page, limit);
  }

  @Post('medications/:medicationId/administer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'ADMIN')
  @HttpCode(201)
  @ApiOperation({ summary: 'Mark a medication as administered' })
  @ApiParam({ name: 'medicationId', type: 'string', description: 'The medication ID' })
  @ApiBody({ type: AdministerMedicationDto })
  @ApiResponse({
    status: 201,
    description: 'Medication administered successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            caseId: { type: 'string' },
            medicationId: { type: 'string' },
            administeredBy: { type: 'string' },
            administeredAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async administerMedication(@Param('medicationId') medicationId: string, @Body() dto: AdministerMedicationDto,@CurrentUser() user: any,) {
    return this.nursesService.administerMedication(dto.medicationId ?? medicationId, user?.nurseId ?? user?.id ?? user?.sub, dto);
  }

  @Post('notes/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'ADMIN')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a clinical note for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiBody({ type: CreateNoteDto })
  @ApiResponse({
    status: 201,
    description: 'Clinical note created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            caseId: { type: 'string' },
            nurseId: { type: 'string' },
            note: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  async createClinicalNote(@Param('caseId') caseId: string, @Body() dto: CreateNoteDto, @CurrentUser() user: any) {
    return this.nursesService.createClinicalNote(caseId, user?.nurseId ?? user?.id ?? user?.sub, dto);
  }

  @Get('notes/:caseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get clinical notes for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Clinical notes list retrieved',
    schema: {
      type: 'object',
      properties: {
        caseId: { type: 'string' },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              nurseId: { type: 'string' },
              note: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  async getClinicalNotes(@Param('caseId') caseId: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.nursesService.getClinicalNotes(caseId, page, limit);
  }
}
