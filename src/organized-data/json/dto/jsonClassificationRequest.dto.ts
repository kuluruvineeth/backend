import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class JsonClassificationRequestDto {
  @ApiProperty({
    description: 'model to use for classfification of the text',
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
    description: 'categories to classify the text into',
    type: [String],
  })
  categories: string[];

  @ApiProperty({
    description: 'text to classify',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({
    description: 'if a debug report of the classification should be generated',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  debug?: boolean;
}
