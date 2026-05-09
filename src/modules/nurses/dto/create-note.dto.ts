import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateNoteDto {
  @ApiProperty({ example: 'Patient is stable. Pain has reduced after medication.' })
  @IsString()
  @MinLength(1)
  note: string;
}