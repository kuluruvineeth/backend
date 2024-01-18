/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from '@nestjs/testing';
import { PdfParserService } from './pdf-parser.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { ISOLogger } from 'src/logger/isoLogger.service';

describe('PdfParserService', () => {
  let service: PdfParserService;
  let logger: ISOLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PdfParserService,
        {
          provide: ISOLogger,
          useValue: {
            debug: jest.fn(),
            warn: jest.fn(),
            log: jest.fn(),
            error: jest.fn(),
            setContent: jest.fn(),
          },
        },
      ],
      imports: [ConfigModule.forRoot(), HttpModule],
    }).compile();

    service = module.get<PdfParserService>(PdfParserService);
    logger = await module.resolve<ISOLogger>(ISOLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('postProcessText', () => {
    it('should trim the lines and remove excess inner whitespace to keep a maximum of 3', () => {
      const input = '       a            b                  c d         ';
      const expected = 'a   b   c d';
      const actutal = service['postProcessText'](input);
      expect(actutal).toEqual(expected);
    });

    it('should keep only one empty line if multiple lines are empty', () => {
      const input = 'a\n\n\nb\n\n\n\nc\nd';
      const expected = 'a\n\nb\n\nc\nd';
      const actual = service['postProcessText'](input);
      expect(actual).toEqual(expected);
    });
  });

  describe('loadPdfFromUrl()', () => {
    it('should load the pdf from url and parse it', async () => {
      const url =
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      const buffer = await service.loadPdfFromUrl(url);

      const expected = 'Dummy PDF file';
      const actual = await service.parsePdf(buffer);

      expect(actual).toEqual(expected);
    });
  });
});
