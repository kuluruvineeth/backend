import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export enum AnalysisModel {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
}

export class JsonAnalyzeRequestDto {
  @ApiProperty({
    description: 'model to use for analysis of the generated json',
    type: 'object',
    properties: {
      apiKey: {
        type: 'string',
        description: 'api key of the model',
        nullable: true,
      },
      name: {
        type: 'string',
        description: 'name of the model',
        default: 'gpt-3.5-turbo',
      },
    },
  })
  @IsObject()
  model: {
    apiKey?: string;
    name: string;
  };

  @ApiProperty({
    description: 'original text from which the json was generated',
  })
  @IsString()
  originalText: string;

  @ApiProperty({
    description: 'json output from the data extraction',
  })
  jsonOutput: string;

  @ApiProperty({
    description: 'json schema used as model for data extraction',
  })
  jsonSchema: string;

  @ApiPropertyOptional({
    description: 'if a debug report of the analysis should be generated',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  debug?: boolean;
}
