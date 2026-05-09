import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Body,       
  Query, 
  HttpCode,
  DefaultValuePipe,   // ← add
  ParseIntPipe,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { PrescribeMedicationDto } from './dto/prescribe-medication.dto';

@ApiTags('doctors')
@ApiCookieAuth('accessToken')
@Controller('api/v1/doctor')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List doctors' })
  @ApiResponse({ status: 200, description: 'Doctors list' })
  async listDoctors(
   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
   @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
) {
  return this.doctorsService.listDoctors(page, limit);
}


  @Get('me/cases')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Get cases assigned to the current doctor' })
  @ApiResponse({ status: 200, description: 'Assigned cases list' })
  async getAssignedCases(@CurrentUser() user: any,
  @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  @Query('status') status?: string,) {
      return this.doctorsService.getAssignedCases(user.doctorId, page, limit, status);  
  }

  @Get('cases/:caseId/lab-results')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Get lab results for a case' })
  @ApiResponse({ status: 200, description: 'Lab results list' })
  async getLabResults(@Param('caseId') caseId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,) {
    return this.doctorsService.getLabResults(caseId, page, limit);
  }

  @Get('cases/:caseId/imaging-reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Get imaging reports for a case' })
  @ApiResponse({ status: 200, description: 'Imaging reports list' })
  async getImagingReports( @Param('caseId') caseId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,) {
    return this.doctorsService.getImagingReports(caseId, page, limit);
  }

  @Get('cases/:caseId/medications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Get prescribed medications for a case' })
  @ApiResponse({ status: 200, description: 'Medication list' })
  async getMedications(
    @Param('caseId') caseId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.doctorsService.getMedications(caseId, page, limit);
  }

  @Post('cases/:caseId/medications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @HttpCode(201)
  @ApiOperation({ summary: 'Prescribe medication for a case' })
  @ApiResponse({ status: 201, description: 'Medication prescribed successfully' })
  async prescribeMedication(@Param('caseId') caseId: string,
    @Body() dto: PrescribeMedicationDto,      // ← was missing
    @CurrentUser() user: any,) {
    return this.doctorsService.prescribeMedication(caseId, user.doctorId, dto);
  }
}
