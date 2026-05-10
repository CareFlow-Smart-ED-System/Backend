import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
import { AssignDoctorDto } from './dto/assign-doctor.dto';
import { ListCasesQueryDto } from './dto/list-cases.query';
import { CaseStatus } from '@prisma/client';
import { UserRole } from '@prisma/client';

@ApiTags('cases')
@ApiCookieAuth('accessToken')
@Controller('api/v1/cases')
export class CasesController {
  constructor(private casesService: CasesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('NURSE', 'RECEPTIONIST')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new emergency case' })
  @ApiBody({ type: CreateCaseDto })
  @ApiResponse({ status: 201, description: 'Case created successfully' })
  async createCase(@Body() dto: CreateCaseDto) {
    return this.casesService.createCase(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE', 'ADMIN')
  @ApiOperation({ summary: 'Get active cases' })
  @ApiQuery({ name: 'status', required: false, enum: CaseStatus })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Cases list' })
  async listCases(
    @CurrentUser() user: any,
    @Query() query: ListCasesQueryDto,
  ) {
    return this.casesService.getCases(
      user,
      query.status,
      Number(query.page ?? 1),
      Number(query.limit ?? 20),
    );
  }

  @Get(':caseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE', 'ADMIN')
  @ApiOperation({ summary: 'Get case details' })
  @ApiParam({ name: 'caseId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Case details' })
  async getCaseDetails(@Param('caseId') caseId: string, @CurrentUser() user: any) {
    return this.casesService.getCaseById(caseId, user);
  }

  @Get(':caseId/timeline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE', 'ADMIN')
  @ApiOperation({ summary: 'Get case timeline' })
  @ApiParam({ name: 'caseId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Case timeline' })
  async getCaseTimeline(@Param('caseId') caseId: string) {
    return this.casesService.getCaseTimeline(caseId);
  }

  @Patch(':caseId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Update case status' })
  @ApiParam({ name: 'caseId', type: 'string' })
  @ApiBody({ type: UpdateCaseStatusDto })
  @ApiResponse({ status: 200, description: 'Case status updated successfully' })
  async updateCaseStatus(
    @Param('caseId') caseId: string,
    @Body() dto: UpdateCaseStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.casesService.updateCaseStatus(caseId, dto, user);
  }

  @Get(':caseId/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Get discharge summary' })
  @ApiParam({ name: 'caseId', type: 'string' })
  @ApiResponse({ status: 200, description: 'Discharge summary' })
  async getDischargeSummary(
    @Param('caseId') caseId: string,
    @CurrentUser() user: any,
  ) {
    return this.casesService.getDischargeSummary(caseId, user);
  }

  @Post(':caseId/doctors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.NURSE)
  @HttpCode(201)
  @ApiOperation({ summary: 'Assign a doctor to a case' })
  @ApiParam({ name: 'caseId', type: 'string' })
  @ApiBody({ type: AssignDoctorDto })
  @ApiResponse({ status: 201, description: 'Doctor assigned successfully' })
  async assignDoctor(
    @Param('caseId') caseId: string,
    @Body() dto: AssignDoctorDto,
    @CurrentUser() user: any,
  ) {
    return this.casesService.assignDoctor(caseId, dto, user);
  }
}
