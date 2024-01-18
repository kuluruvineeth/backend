import { Test, TestingModule } from '@nestjs/testing';
import { LLMService } from './llm.service';
import { PromptTemplate } from 'langchain/prompts';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  LLMApiKeyInvalidError,
  LLMApiKeyMissingError,
  LLMNotAvailableError,
  PromptTemplateFormateError,
} from './exceptions/exceptions';
import { ISOLogger } from 'src/logger/isoLogger.service';

describe('LlmserviceService', () => {
  let service: LLMService;
  let configService: ConfigService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let logger: ISOLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        LLMService,
        {
          provide: ISOLogger,
          useValue: {
            debug: jest.fn(),
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            setContent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LLMService>(LLMService);
    configService = module.get<ConfigService>(ConfigService);
    logger = await module.resolve<ISOLogger>(ISOLogger);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateOutput()', () => {
    it('should generate an output', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      const { output, debugReport } = await service.generateOutput(
        model,
        promptTemplate,
        {
          product: 'cars',
        },
        true,
      );

      expect(output).toBeDefined();
      expect(debugReport).toBeDefined();
    });

    it('should generate an output with a debug report', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      const { output, debugReport } = await service.generateOutput(
        model,
        promptTemplate,
        {
          product: 'cars',
        },
        true,
      );

      expect(output).toBeDefined();
      expect(debugReport).toBeDefined();
      expect(debugReport).toHaveProperty('chainCallCount');
      expect(debugReport).toHaveProperty('llmCallCount');
      expect(debugReport).toHaveProperty('chains');
      expect(debugReport).toHaveProperty('llms');
    }, 10000);

    it('should throw if the model given is not available', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-42',
      };
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      await expect(
        service.generateOutput(
          model,
          promptTemplate,
          {
            product: 'cars',
          },
          true,
        ),
      ).rejects.toThrow(LLMNotAvailableError);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw if the given model needs a missing api key', async () => {
      const model = {
        name: 'gpt-3.5-turbo',
      };
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      await expect(
        service.generateOutput(
          model,
          promptTemplate,
          {
            product: 'cars',
          },
          true,
        ),
      ).rejects.toThrow(LLMApiKeyMissingError);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw if the given api key is invalid', async () => {
      const model = {
        apiKey: 'invalid',
        name: 'gpt-3.5-turbo',
      };
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      await expect(
        service.generateOutput(
          model,
          promptTemplate,
          {
            product: 'cars',
          },
          true,
        ),
      ).rejects.toThrow(LLMApiKeyInvalidError);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw if the chain values do not match the input variables of the prompt template', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      const output = await service.generateOutput(
        model,
        promptTemplate,
        {
          wrongValue: 'cars',
        },
        true,
      );

      expect(output).rejects.toThrow(PromptTemplateFormateError);
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('generateRefineOutput()', () => {
    it('should generate the correct output from a chuncked document', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const text = `
      This is the first sentence of the testing text.\n
      This is the second sentence of the testing text. It contains the tagged value to output: llm-organizer`;

      const documents = await service.splitDocument(text, {
        chunkSize: 100,
        overlap: 0,
      });
      const initialPromptTemplate = new PromptTemplate({
        template: `Given the following text, please write the value to output.
        -----------------
        {context}
        -----------------
        Output:`,
        inputVariables: ['context'],
      });

      const refinePromptTemplate = new PromptTemplate({
        template: `
        Given the following text, please only write the tagged value to output.
        -----------------
        You have provided an existing output:
        {existing_answer}
        
        We have the opportunity to refine the original output to give a better answer.
        If the context isn't useful, return the existing output.`,
        inputVariables: ['existing_answer', 'context'],
      });

      const { output, llmCallCount, debugReport } =
        await service.generateRefineOutput(
          model,
          initialPromptTemplate,
          refinePromptTemplate,
          {
            input_documents: documents,
          },
          false,
        );

      expect(output).toBeDefined();
      expect(output['output_text']).toContain('llm-organizer');
      expect(llmCallCount).toBe(2);
      expect(debugReport).toBeNull();
    }, 70000);

    it('should generate the correct output from a chunked document with a debug report', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const text = `
      This is the first sentence of the testing text.\n
      This is the second sentence of the testing text. It contains the tagged value to output: llm-organizer`;

      const documents = await service.splitDocument(text, {
        chunkSize: 100,
        overlap: 0,
      });
      const initialPromptTemplate = new PromptTemplate({
        template: `Given the following text, please write the value to output.
        -----------------
        {context}
        -----------------
        Output:`,
        inputVariables: ['context'],
      });

      const refinePromptTemplate = new PromptTemplate({
        template: `
        Given the following text, please only write the tagged value to output.
        -----------------
        You have provided an existing output:
        {existing_answer}
        
        We have the opportunity to refine the original output to give a better answer.
        If the context isn't useful, return the existing output.`,
        inputVariables: ['existing_answer', 'context'],
      });

      const { output, llmCallCount, debugReport } =
        await service.generateRefineOutput(
          model,
          initialPromptTemplate,
          refinePromptTemplate,
          {
            input_documents: documents,
          },
          true,
        );

      expect(output).toBeDefined();
      expect(output['output_text']).toContain('llm-organizer');
      expect(llmCallCount).toBe(2);
      expect(debugReport).toBeDefined();
      expect(debugReport).toHaveProperty('chainCallCount');
      expect(debugReport).toHaveProperty('llmCallCount');
      expect(debugReport).toHaveProperty('chains');
      expect(debugReport).toHaveProperty('llms');
    }, 20000);

    it('should throw if the model given is not available', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-42',
      };
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      await expect(
        service.generateRefineOutput(model, promptTemplate, promptTemplate, {
          input_documents: [],
        }),
      ).rejects.toThrow(LLMNotAvailableError);
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw if there are reserved input variables in chainValues', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      const output = await service.generateRefineOutput(
        model,
        promptTemplate,
        promptTemplate,
        {
          input_documents: [],
          context: 'Not allowed',
        },
      );

      expect(output).rejects.toThrow(
        `Reserved chain value context or existing_answer cannot be used as an input variable`,
      );
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw if the initial prompt template does not have context input variable', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const promptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      const output = await service.generateRefineOutput(
        model,
        promptTemplate,
        promptTemplate,
        {
          input_documents: [],
        },
      );

      expect(output).rejects.toThrow(
        `initialPromptTemplate is missing mandatory input variable: context.`,
      );
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw if the refine prompt template does not have context input variable', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const initialPromptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {context}?',
        inputVariables: ['context'],
      });

      const refinePromptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {product}?',
        inputVariables: ['product'],
      });

      const output = await service.generateRefineOutput(
        model,
        initialPromptTemplate,
        refinePromptTemplate,
        {
          input_documents: [],
        },
      );

      expect(output).rejects.toThrow(
        `refinePromptTemplate is missing mandatory input variable: context.`,
      );
      expect(logger.warn).toHaveBeenCalled();
    });

    it('should throw if the refine prompt template does not have existing_answer input variable', async () => {
      const model = {
        apiKey: configService.get('OPENAI_API_KEY'),
        name: 'gpt-3.5-turbo',
      };
      const initialPromptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {context}?',
        inputVariables: ['context'],
      });

      const refinePromptTemplate = new PromptTemplate({
        template: 'What is a good name for a company that makes {context}?',
        inputVariables: ['context'],
      });

      const output = await service.generateRefineOutput(
        model,
        initialPromptTemplate,
        refinePromptTemplate,
        {
          input_documents: [],
        },
      );

      expect(output).rejects.toThrow(
        `refinePromptTemplate is missing mandatory input variable: existing_answer.`,
      );
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
