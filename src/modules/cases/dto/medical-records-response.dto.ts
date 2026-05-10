import { ApiProperty } from '@nestjs/swagger';

export class MedicalRecordItemDto {
  @ApiProperty({ description: 'Record ID', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  recordId: string;

  @ApiProperty({ description: 'Case ID', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480' })
  caseId: string;

  @ApiProperty({ description: 'Diagnosis', example: 'Acute appendicitis' })
  diagnosis: string;

  @ApiProperty({ description: 'Notes', example: 'Patient presented with severe right lower quadrant pain' })
  notes: string;

  @ApiProperty({ description: 'Chronic diseases', example: 'Type 2 Diabetes', required: false })
  chronicDiseases?: string | null;

  @ApiProperty({ description: 'Family history', example: 'Hypertension, Stroke', required: false })
  familyHistory?: string | null;

  @ApiProperty({ description: 'Created timestamp', example: '2026-05-10T12:00:00Z' })
  createdAt: string;

  @ApiProperty({ description: 'Updated timestamp', example: '2026-05-10T12:00:00Z' })
  updatedAt: string;
}

export class GetMedicalRecordsResponseDto {
  @ApiProperty({ description: 'Patient ID', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d481' })
  patientId: string;

  @ApiProperty({ description: 'Total records', example: 5 })
  total: number;

  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Records per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total pages', example: 1 })
  totalPages: number;

  @ApiProperty({ description: 'Medical records list', type: [MedicalRecordItemDto] })
  data: MedicalRecordItemDto[];
}
