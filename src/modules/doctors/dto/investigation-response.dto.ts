import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class LabResultItemDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Blood Count' })
  type: string;

  @ApiProperty({ example: 'WBC: 13.2 × 10³/µL (High)' })
  result: string;

  @ApiProperty({ example: '2025-05-04', format: 'date' })
  date: Date;

  @ApiProperty({ example: 'AVAILABLE' })
  status: string;

  @ApiPropertyOptional({ example: '/uploads/lab-reports/cbc-report.pdf' })
  reportFileUrl?: string;

  @ApiPropertyOptional({ example: 'cbc-report.pdf' })
  reportFileName?: string;
}

export class GetLabResultsResponseDto {
  @ApiProperty({ example: 'uuid' })
  caseId: string;

  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ type: [LabResultItemDto] })
  data: LabResultItemDto[];
}

export class ImagingReportItemDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'CT' })
  type: string;

  @ApiPropertyOptional({ example: 'Abdomen' })
  region?: string;

  @ApiProperty({ example: 'Findings consistent with acute appendicitis' })
  report: string;

  @ApiProperty({ example: '2025-05-04', format: 'date' })
  date: Date;

  @ApiProperty({ example: 'AVAILABLE' })
  status: string;

  @ApiPropertyOptional({ example: '/uploads/imaging-reports/ct-abdomen.pdf' })
  reportFileUrl?: string;

  @ApiPropertyOptional({ example: 'ct-abdomen.pdf' })
  reportFileName?: string;
}

export class GetImagingResultsResponseDto {
  @ApiProperty({ example: 'uuid' })
  caseId: string;

  @ApiProperty({ example: 3 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ type: [ImagingReportItemDto] })
  data: ImagingReportItemDto[];
}

export class UploadLabReportDto {
  @ApiPropertyOptional({ example: 'CBC official report attached' })
  notes?: string;
}

export class UploadImagingReportDto {
  @ApiPropertyOptional({ example: 'CT abdomen confirms appendicitis' })
  summary?: string;
}

export class CreateLabOrderDto {
  @ApiProperty({ example: 'Complete Blood Count' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'Please perform CBC and differential' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateImagingOrderDto {
  @ApiProperty({ example: 'CT' })
  @IsString()
  type: string;

  @ApiPropertyOptional({ example: 'Abdomen' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'Suspected appendicitis' })
  @IsOptional()
  @IsString()
  summary?: string;
}

export class UploadedLabReportResponseDto {
  @ApiProperty({ example: 'Lab report uploaded successfully' })
  message: string;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string' },
      caseId: { type: 'string' },
      reportFileUrl: { type: 'string', nullable: true },
      reportFileName: { type: 'string', nullable: true },
      uploadedBy: { type: 'string', nullable: true },
      uploadedAt: { type: 'string', format: 'date-time', nullable: true },
    },
  })
  data: Record<string, unknown>;
}

export class UploadedImagingReportResponseDto {
  @ApiProperty({ example: 'Imaging report uploaded successfully' })
  message: string;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string' },
      caseId: { type: 'string' },
      reportFileUrl: { type: 'string', nullable: true },
      reportFileName: { type: 'string', nullable: true },
      reportedBy: { type: 'string', nullable: true },
      uploadedAt: { type: 'string', format: 'date-time', nullable: true },
    },
  })
  data: Record<string, unknown>;
}
