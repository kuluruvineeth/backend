import { DebugReport } from '@/organized-data/llm/dto/debug.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class JsonGenericOutputResultDto {
  @ApiProperty({
    description: 'model used for generic prompt completion',
  })
  model: string;

  @ApiProperty({
    description: 'generic output as string',
  })
  @IsString()
  output: string;

  @ApiPropertyOptional({
    description: 'debug report of the json extraction',
    default: false,
    required: false,
  })
  @IsObject()
  @IsOptional()
  debug?: DebugReport;
}
