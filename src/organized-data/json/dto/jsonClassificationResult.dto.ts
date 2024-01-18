import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
import { DebugReport } from 'src/organized-data/llm/dto/debug.dto';

export class Classification {
  @ApiProperty({
    description: 'classification of the text',
  })
  classification: string;

  @ApiProperty({
    description: 'confidence of the classification in percentage',
  })
  confidence: string;
}

export class JsonClassificationResultDto {
  @ApiProperty({
    description: 'model used for classification',
  })
  model: string;

  @ApiProperty({
    description: 'classification of the text',
  })
  classification: Classification;

  @ApiPropertyOptional({
    description: 'debug report of the classification',
    default: false,
    required: false,
  })
  @IsObject()
  @IsOptional()
  debug?: DebugReport;
}
