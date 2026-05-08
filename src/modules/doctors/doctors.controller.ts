import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('api/v1/doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async listDoctors() {
    // TODO: Implement list doctors
  }

  @Get('me/cases')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  async getAssignedCases(@CurrentUser() user: any) {
    // TODO: Implement get assigned cases
  }

  @Get('cases/:caseId/lab-results')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  async getLabResults(@Param('caseId') caseId: string) {
    // TODO: Implement get lab results
  }

  @Get('cases/:caseId/imaging-reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  async getImagingReports(@Param('caseId') caseId: string) {
    // TODO: Implement get imaging reports
  }

  @Post('cases/:caseId/medications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR')
  @HttpCode(201)
  async prescribeMedication(@Param('caseId') caseId: string) {
    // TODO: Implement prescribe medication
  }
}
