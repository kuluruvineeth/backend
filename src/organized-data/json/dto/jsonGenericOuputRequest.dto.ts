import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class JsonGenericOutputRequestDto {
  @ApiProperty({
    description: 'model to use for generic prompt completion',
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
    description: 'prompt to provide to the model',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiPropertyOptional({
    description:
      'if a debug report of the generic output generation should be generated',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  debug?: boolean;
}
