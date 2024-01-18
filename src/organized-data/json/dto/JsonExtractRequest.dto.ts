import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsJSON,
  IsNotEmpty,
  IsObject,
  IsOptional,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { RefineParams } from '../types/types';

export enum Model {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4 = 'gpt-4',
}

@ValidatorConstraint({ name: 'boolean-or-refineParams', async: false })
class IsBooleanOrRefineParams implements ValidatorConstraintInterface {
  validate(text: any) {
    if (typeof text === 'boolean') {
      return true;
    }
    if (typeof text === 'object') {
      return (
        typeof text.chunkSize === 'number' &&
        typeof text.overlap === 'number' &&
        text.chunkSize > 0 &&
        text.overlap > 0 &&
        text.chunkSize > text.overlap
      );
    }
  }

  defaultMessage() {
    return 'refine can be undefined, a boolean or an object with chunkSize > 0 and overlap >=0';
  }
}

class JsonExtractRequestDto {
  @ApiProperty({
    description: 'text to extract structured data from',
  })
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    description: 'model to use for data extraction',
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

  @ApiPropertyOptional({
    description: 'if a debug report of the json extraction should be generated',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  debug?: boolean;
}

class SchemaRequestDto {
  @ApiProperty({
    description: 'json schema to use as model for data extraction',
  })
  @IsJSON()
  jsonSchema: string;

  @ApiPropertyOptional({
    oneOf: [
      {
        description: 'if refine multi-step extraction should be used',
        type: 'boolean',
        default: false,
      },
      {
        description: 'parameters for refine multi-step extraction',
        type: 'object',
        properties: {
          chunkSize: {
            type: 'number',
            description: 'size of chunks to split the document into',
            default: 2000,
          },
          overlap: {
            type: 'number',
            description: 'overlap between chunks',
            default: 100,
          },
        },
      },
    ],
  })
  @Validate(IsBooleanOrRefineParams)
  @IsOptional()
  refine?: boolean | RefineParams;
}

class ExampleRequestDto {
  @ApiProperty({
    description: 'example input text',
  })
  @IsNotEmpty()
  exampleInput: string;

  @ApiProperty({
    description: 'example of desired json output',
  })
  @IsJSON()
  exampleOutput: string;
}

export class JsonExtractSchemaRequestDto extends IntersectionType(
  JsonExtractRequestDto,
  SchemaRequestDto,
) {}

export class JsonExtractExampleRequestDto extends IntersectionType(
  JsonExtractRequestDto,
  ExampleRequestDto,
) {}
