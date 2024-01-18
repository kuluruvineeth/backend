import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';
import { DebugReport } from 'src/organized-data/llm/dto/debug.dto';

export class Analysis {
  @ApiProperty({
    description: 'list of corrections',
  })
  @IsArray()
  corrections: Correction[];

  @ApiProperty({
    description: 'full textual analysis of the issue',
  })
  @IsString()
  textAnalysis: string;
}

export class Correction {
  @ApiProperty({
    description: 'field that needs to be corrected',
  })
  field: string;
  @ApiProperty({
    description: 'issue found in the field',
  })
  issue: string;
  @ApiProperty({
    description: 'description if the issue, reason for why it is an issue',
  })
  description: string;
  @ApiProperty({
    description: 'issue found in the field',
  })
  suggestion: string;
}

export class JsonAnalyzeResultDto {
  @ApiProperty({
    description: 'suggestion for how to correct the issue',
  })
  model: string;

  @ApiProperty({
    description: 'analysis of the generated json',
  })
  analysis: Analysis;

  @ApiPropertyOptional({
    description: 'debug report of the analysis',
    default: false,
    required: false,
  })
  @IsObject()
  @IsOptional()
  debug?: DebugReport;
}
