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
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NursesService } from './nurses.service';
import { CreateVitalSignsDto } from './dto/create-vital-signs.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { AdministerMedicationDto } from './dto/administer-medication.dto';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Injectable, NotFoundException } from '@nestjs/common';

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
  async createVitalSigns(@Param('caseId') caseId: string, @Body() dto: CreateVitalSignsDto,
    @CurrentUser() user: any,
) {
   return this.nursesService.createVitalSigns(caseId, user.nurseId, dto);
  }

  @Get('vital-signs/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get vital signs for a case' })
  @ApiResponse({ status: 200, description: 'Vital signs list' })
  async getVitalSigns(@Param('caseId') caseId: string,@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,) {
    return this.nursesService.getVitalSigns(caseId, page, limit);
  }

  @Post('medications/:medicationId/administer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'ADMIN')
  @HttpCode(201)
  @ApiOperation({ summary: 'Mark a medication as administered' })
  @ApiResponse({ status: 201, description: 'Medication administered successfully' })
  async administerMedication(@Param('medicationId') medicationId: string, @Body() dto: AdministerMedicationDto,@CurrentUser() user: any,) {
    return this.nursesService.administerMedication(dto.medicationId ?? medicationId, user.nurseId, dto);
  }

  @Post('notes/:caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'ADMIN')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a clinical note for a case' })
  @ApiResponse({ status: 201, description: 'Clinical note created successfully' })
  async createClinicalNote(@Param('caseId') caseId: string, @Body() dto: CreateNoteDto, @CurrentUser() user: any) {
    return this.nursesService.createClinicalNote(caseId, user.nurseId, dto);
  }

  @Get('notes/:caseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get clinical notes for a case' })
  @ApiResponse({ status: 200, description: 'Clinical notes list' })
  async getClinicalNotes(@Param('caseId') caseId: string, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number) {
    return this.nursesService.getClinicalNotes(caseId, page, limit);
  }
}
