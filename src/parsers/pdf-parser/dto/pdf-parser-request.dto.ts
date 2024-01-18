import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class PdfParserRequestDto {
  @ApiProperty({
    description: 'URL of the PDF file to parse',
  })
  @IsUrl()
  url: string;
}
