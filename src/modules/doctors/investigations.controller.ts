import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UploadedFile,
  Body,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join, basename } from 'path';
import { DoctorsService } from './doctors.service';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import {
  GetImagingResultsResponseDto,
  GetLabResultsResponseDto,
  UploadImagingReportDto,
  UploadLabReportDto,
  UploadedImagingReportResponseDto,
  UploadedLabReportResponseDto,
  CreateLabOrderDto,
  CreateImagingOrderDto,
} from './dto/investigation-response.dto';

const createPdfUploadOptions = (folderName: string) => {
  const destination = join(process.cwd(), 'uploads', folderName);
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }

  return {
    storage: diskStorage({
      destination,
      filename: (_req: any, file: any, callback: any) => {
        const safeBaseName = basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        callback(null, `${Date.now()}-${safeBaseName}`);
      },
    }),
    fileFilter: (_req: any, file: any, callback: any) => {
      const isPdf =
        file.mimetype === 'application/pdf' ||
        extname(file.originalname).toLowerCase() === '.pdf';
      if (!isPdf) {
        return callback(new BadRequestException('Only PDF files are allowed'), false);
      }
      callback(null, true);
    },
    limits: { fileSize: 15 * 1024 * 1024 },
  };
};

@ApiTags('doctors')
@ApiCookieAuth('accessToken')
@Controller('api/v1')
export class InvestigationsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get('doctors/cases/:caseId/lab-results')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.LAB_STAFF)
  @ApiOperation({ summary: 'Get lab results for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ description: 'Lab results list retrieved successfully', type: GetLabResultsResponseDto })
  @ApiResponse({ status: 403, description: 'Unauthorized access to this case' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getLabResults(
    @Param('caseId') caseId: string,
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.doctorsService.getLabResults(caseId, user, page, limit);
  }

  @Get('doctors/cases/:caseId/imaging')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.RADIOLOGIST)
  @ApiOperation({ summary: 'Get imaging reports for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiOkResponse({ description: 'Imaging reports list retrieved successfully', type: GetImagingResultsResponseDto })
  @ApiResponse({ status: 403, description: 'Unauthorized access to this case' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getImagingReports(
    @Param('caseId') caseId: string,
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.doctorsService.getImagingReports(caseId, user, page, limit);
  }

  @Post('doctors/cases/:caseId/lab-results')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create a lab order for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiBody({ type: CreateLabOrderDto })
  @ApiOkResponse({ description: 'Lab order created', type: require('./dto/investigation-response.dto').LabResultItemDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createLabOrder(
    @Param('caseId') caseId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateLabOrderDto,
  ) {
    return this.doctorsService.createLabOrder(caseId, user, dto);
  }

  @Post('doctors/cases/:caseId/imaging')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create an imaging order for a case' })
  @ApiParam({ name: 'caseId', type: 'string', description: 'The case ID' })
  @ApiBody({ type: CreateImagingOrderDto })
  @ApiOkResponse({ description: 'Imaging order created', type: require('./dto/investigation-response.dto').ImagingReportItemDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async createImagingOrder(
    @Param('caseId') caseId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateImagingOrderDto,
  ) {
    return this.doctorsService.createImagingOrder(caseId, user, dto);
  }

  @Post('lab-results/:labResultId/upload-report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('LAB_STAFF')
  @UseInterceptors(FileInterceptor('reportFile', createPdfUploadOptions('lab-reports')))
  @ApiOperation({ summary: 'Upload an official PDF report for a lab result' })
  @ApiParam({ name: 'labResultId', type: 'string', description: 'The lab result ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reportFile'],
      properties: {
        reportFile: { type: 'string', format: 'binary' },
        notes: { type: 'string', nullable: true },
      },
    },
  })
  @ApiOkResponse({ description: 'Lab report uploaded successfully', type: UploadedLabReportResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file upload request' })
  @ApiResponse({ status: 404, description: 'Lab result not found' })
  async uploadLabReport(
    @Param('labResultId') labResultId: string,
    @UploadedFile() reportFile: any,
    @Body() _dto: UploadLabReportDto,
    @CurrentUser() user: any,
  ) {
    return this.doctorsService.uploadLabReport(labResultId, user, reportFile);
  }

  @Post('imaging/:imagingId/upload-report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RADIOLOGIST')
  @UseInterceptors(FileInterceptor('reportFile', createPdfUploadOptions('imaging-reports')))
  @ApiOperation({ summary: 'Upload an official PDF report for an imaging study' })
  @ApiParam({ name: 'imagingId', type: 'string', description: 'The imaging report ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reportFile'],
      properties: {
        reportFile: { type: 'string', format: 'binary' },
        summary: { type: 'string', nullable: true },
      },
    },
  })
  @ApiOkResponse({ description: 'Imaging report uploaded successfully', type: UploadedImagingReportResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid file upload request' })
  @ApiResponse({ status: 404, description: 'Imaging report not found' })
  async uploadImagingReport(
    @Param('imagingId') imagingId: string,
    @UploadedFile() reportFile: any,
    @Body() _dto: UploadImagingReportDto,
    @CurrentUser() user: any,
  ) {
    return this.doctorsService.uploadImagingReport(imagingId, user, reportFile);
  }
}
