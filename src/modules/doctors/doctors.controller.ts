import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('doctors')
@ApiCookieAuth('accessToken')

@Controller('api/v1/doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List doctors' })
  @ApiResponse({ status: 200, description: 'Doctors list' })
  async listDoctors() {
    // TODO: Implement list doctors
  }

  @Get('me/cases')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Get cases assigned to the current doctor' })
  @ApiResponse({ status: 200, description: 'Assigned cases list' })
  async getAssignedCases(@CurrentUser() user: any) {
    // TODO: Implement get assigned cases
  }

  @Get('cases/:caseId/lab-results')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Get lab results for a case' })
  @ApiResponse({ status: 200, description: 'Lab results list' })
  async getLabResults(@Param('caseId') caseId: string) {
    // TODO: Implement get lab results
  }

  @Get('cases/:caseId/imaging-reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Get imaging reports for a case' })
  @ApiResponse({ status: 200, description: 'Imaging reports list' })
  async getImagingReports(@Param('caseId') caseId: string) {
    // TODO: Implement get imaging reports
  }

  @Post('cases/:caseId/medications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @HttpCode(201)
  @ApiOperation({ summary: 'Prescribe medication for a case' })
  @ApiResponse({ status: 201, description: 'Medication prescribed successfully' })
  async prescribeMedication(@Param('caseId') caseId: string) {
    // TODO: Implement prescribe medication
  }
}
