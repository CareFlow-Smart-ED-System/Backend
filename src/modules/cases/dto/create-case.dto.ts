import { IsString } from 'class-validator';

export class CreateCaseDto {
  @IsString()
  patientId: string;
}