import { IsUUID } from 'class-validator';

export class CreateCaseDto {
  @IsUUID()
  patientId: string;
}