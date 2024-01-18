import { Test, TestingModule } from '@nestjs/testing';
import { JsonService } from './json.service';
import { LLMService } from '../llm/llm.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InvalidJsonOutputError } from './exceptions/exceptions';
// import { ISOLogger } from '../../logger/isoLogger.service';

describe('JsonService', () => {
  let service: JsonService;
  let llmService: LLMService;
  let configService: ConfigService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // let logger: ISOLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        JsonService,
        LLMService,
        // {
        //   provide: ISOLogger,
        //   useValue: {
        //     debug: jest.fn(),
        //     log: jest.fn(),
        //     warn: jest.fn(),
        //     error: jest.fn(),
        //     setContent: jest.fn(),
        //   },
        // },
      ],
    }).compile();

    service = module.get<JsonService>(JsonService);
    llmService = module.get<LLMService>(LLMService);
    configService = module.get<ConfigService>(ConfigService);
    // logger = await module.resolve<ISOLogger>(ISOLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractWithSchema()', () => {
    it('should return a json object', async () => {
      const text = 'This is a text';
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const schema = '{"title": "string", "description": "string"}';
      const { json } = await service.extractWithSchema(text, model, schema);
      expect(json).toBeDefined();
      expect(json).toHaveProperty('title');
      expect(json).toHaveProperty('description');
    });

    it('should throw an error if the output is not a valid json', async () => {
      const text = 'This is a text';
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const schema = '{"title": "string", "description": "string"}';
      jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
        output: { text: '{"title": "string", "description": "string"' },
        debugReport: null,
      });
      await expect(
        service.extractWithSchema(text, model, schema),
      ).rejects.toThrow(InvalidJsonOutputError);
      // expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('extractWithExample()', () => {
    it('should return a json object', async () => {
      const text = 'This is a text';
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const example = {
        input: 'This is a text',
        output: '{"title": "string", "description": "string"}',
      };
      const { json } = await service.extractWithExample(text, model, example);
      expect(json).toBeDefined();
      expect(json).toHaveProperty('title');
      expect(json).toHaveProperty('description');
    });

    it('should throw an error if the output is not a valid json', async () => {
      const text = 'This is a text';
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const example = {
        input: 'This is a text',
        output: '{"title": "string", "description": "string"}',
      };
      jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
        output: { text: '{"title": "string", "description": "string"' },
        debugReport: null,
      });
      await expect(
        service.extractWithExample(text, model, example),
      ).rejects.toThrow(InvalidJsonOutputError);
      // expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('analyzeJsonOutput()', () => {
    it('should return an Analysis object', async () => {
      const originalText = 'This is a text';
      const jsonOutput = {
        title: 'This is a title',
        description: 'This is a text',
      };
      const schema = '{"title": "string", "description": "string"}';
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const { json: analysis } = await service.analyzeJsonOutput(
        model,
        JSON.stringify(jsonOutput),
        originalText,
        schema,
      );

      expect(analysis).toBeDefined();
      expect(analysis).toHaveProperty('corrections');
      expect(analysis).toHaveProperty('textAnalysis');
    }, 20000);

    it('should throw if the output is not a valid Analysis object', async () => {
      const originalText = 'This is a text';
      const jsonOutput = {
        title: 'This is a title',
        description: 'This is a text',
      };
      const schema = '{"title": "string", "description": "string"}';
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
        output: { text: '{}{analysis}' },
        debugReport: null,
      });

      await expect(
        service.analyzeJsonOutput(
          model,
          JSON.stringify(jsonOutput),
          originalText,
          schema,
        ),
      ).rejects.toThrow(InvalidJsonOutputError);
      // expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('classifyText()', () => {
    it('should return a classification object', async () => {
      const text = 'This is a text representing a positive sentiment';
      const categories = ['positive', 'negative'];
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const { json: classification } = await service.classifyText(
        model,
        text,
        categories,
      );

      expect(classification).toBeDefined();
      expect(classification).toHaveProperty('classification');
      expect(classification).toHaveProperty('confidence');
      expect(classification.classification).toBe('positive');
    }, 30000);
    it('should return a classification object with other as a value', async () => {
      const text =
        'This is a text expressing neither a positive sentiment nor a negative one';
      const categories = ['positive', 'negative'];
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const { json: classification } = await service.classifyText(
        model,
        text,
        categories,
      );

      expect(classification).toBeDefined();
      expect(classification).toHaveProperty('classification');
      expect(classification).toHaveProperty('confidence');
      expect(classification.classification).toBe('other');
    }, 30000);
    it('should throw if the output is not a valid classification object', async () => {
      const text = 'This is a text representing a positive sentiment';
      const categories = ['positive', 'negative'];
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      jest.spyOn(llmService, 'generateOutput').mockResolvedValue({
        output: {
          text: '{}{classification}',
        },
        debugReport: null,
      });
      await expect(
        service.classifyText(model, text, categories),
      ).rejects.toThrow(InvalidJsonOutputError);
      // expect(logger.warn).toHaveBeenCalled();
    }, 30000);
  });

  describe('handleGenericPrompt()', () => {
    it('should return an output with the result of the generic prompt', async () => {
      const outputFormat = {
        sentence: 'string',
      };

      const prompt = `You are helpful assistant. Your only task is to say "Hello World" to the user.
      
      Please ALWAYS provide your output in the following format as a JSON object:
      
      ${JSON.stringify(outputFormat)}
      
      Your output:
      `;

      const prompt2 = 'Say "Hello World"';

      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };

      const { json } = await service.handleGenericPrompt(model, prompt);
      expect(json).toBeDefined();
      expect(json).toHaveProperty('output');
      expect(json.output).toBe('{"sentence":"Hello World"}');

      const { json: json2 } = await service.handleGenericPrompt(model, prompt2);
      expect(json2).toBeDefined();
      expect(json2).toHaveProperty('output');
      expect(json2.output).toBe('Hello World');
    }, 30000);
  });
});
