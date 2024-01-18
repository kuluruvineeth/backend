import { Injectable } from '@nestjs/common';

import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BaseLanguageModel } from 'langchain/dist/base_language';
import { PromptTemplate } from 'langchain/prompts';
import { ChainValues } from 'langchain/dist/schema';
import { LLMChain, loadQARefineChain } from 'langchain/chains';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import {
  LLMApiKeyInvalidError,
  LLMApiKeyMissingError,
  LLMBadRequestReceivedError,
  LLMNotAvailableError,
  PromptTemplateFormateError,
  RefinePromptInputVaribalesError,
  RefineReservedChainValuesError,
} from './exceptions/exceptions';
import { Document } from 'langchain/document';
import { Model } from './types/types';
import { RefineCallbackHandler } from './callbackHandlers/refineHandler';
import { DebugCallbackHandler } from './callbackHandlers/debugHandler';
// import { ISOLogger } from '@/logger/isoLogger.service';

@Injectable()
export class LLMService {
  // constructor(private logger: ISOLogger) {
  //   this.logger.setContext(LLMService.name);
  // }
  async generateOutput(
    model: Model,
    promptTemplate: PromptTemplate,
    chainValues: ChainValues,
    debug: boolean,
  ) {
    const llm = this.retrieveAvailableModel(model);
    // this.logger.debug(
    //   `Using model ${model.name} ${model.apiKey ? 'with' : 'without'} API key`,
    // );

    try {
      await promptTemplate.format(chainValues);
    } catch (e) {
      // this.logger.error("Prompt template doesn't match input variables");
      throw new PromptTemplateFormateError();
    }

    const llmChain = new LLMChain({
      llm,
      prompt: promptTemplate,
    });

    try {
      const handler = new DebugCallbackHandler();
      const output = await llmChain.call(chainValues, debug ? [handler] : []);
      // this.logger.debug('generateOutput completed successfully');
      return { output, debugReport: debug ? handler.debugReport : null };
    } catch (e) {
      if (e?.response?.status && e?.response?.status === 401) {
        //this.logger.warn('LLMApiKeyInvalidError thrown');
        throw new LLMApiKeyInvalidError(model.name);
      }
      if (e?.response?.status && e?.response?.status === 400) {
        //this.logger.warn('LLMBadRequestReceivedError thrown');
        throw new LLMBadRequestReceivedError(model.name);
      }
      //this.logger.warn('Undefined error thrown');
      throw e;
    }
  }

  async splitDocument(
    document: string,
    params: { chunkSize: number; overlap: number },
  ) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: params?.chunkSize,
      chunkOverlap: params?.overlap,
    });

    const output = await splitter.createDocuments([document]);
    // this.logger.debug(
    //   `splitDocument created ${output.length} documents (chunks size: ${params.chunkSize}, overlap: ${params.overlap})`,
    // );
    return output;
  }

  async generateRefineOutput(
    model: Model,
    initialPromptTemplate: PromptTemplate,
    refinePromptTemplate: PromptTemplate,
    chainValues: ChainValues & { input_documents: Document[] },
    debug: boolean = false,
  ) {
    const llm = this.retrieveAvailableModel(model);

    // this.logger.debug(
    //   `Using model ${model.name} ${model.apiKey ? 'with' : 'without'} API key`,
    // );
    if (chainValues['context'] || chainValues['existing_answer']) {
      // this.logger.error(
      //   "Reserved chain values 'context' & 'existing_answer' can't be used",
      // );
      throw new RefineReservedChainValuesError('context or existing_answer');
    }

    this.throwErrorIfInputVariableMissing(
      'initialPromptTemplate',
      'context',
      initialPromptTemplate.inputVariables,
    );

    this.throwErrorIfInputVariableMissing(
      'refinePromptTemplate',
      'context',
      refinePromptTemplate.inputVariables,
    );

    this.throwErrorIfInputVariableMissing(
      'refinePromptTemplate',
      'existing_answer',
      refinePromptTemplate.inputVariables,
    );

    const refineChain = loadQARefineChain(llm, {
      questionPrompt: initialPromptTemplate,
      refinePrompt: refinePromptTemplate,
    });

    try {
      const debugHandler = new DebugCallbackHandler();
      const handler = new RefineCallbackHandler();

      const output = await refineChain.call(
        chainValues,
        debug ? [handler, debugHandler] : [handler],
      );
      //this.logger.debug('generateRefineOutput completed successfully');
      return {
        output,
        llmCallCount: handler.llmCallCount,
        debugReport: debug ? debugHandler.debugReport : null,
      };
    } catch (e) {
      if (e?.response?.status && e?.response?.status === 401) {
        //this.logger.warn('LLMApiKeyInvalidError thrown');
        throw new LLMApiKeyInvalidError(model.name);
      }
      if (e?.response?.status && e?.response?.status === 400) {
        //this.logger.warn('LLMBadRequestReceivedError thrown');
        throw new LLMBadRequestReceivedError(model.name);
      }
      //this.logger.warn('Undefined error thrown');
      throw e;
    }
  }

  private throwErrorIfInputVariableMissing(
    templateName: string,
    variableName: string,
    inputVariables: string[],
  ) {
    if (!inputVariables.includes(variableName)) {
      // this.logger.error(
      //   `Input variable ${variableName} is missing from ${templateName}`,
      // );
      throw new RefinePromptInputVaribalesError(templateName, variableName);
    }
  }

  private retrieveAvailableModel(model: Model): BaseLanguageModel {
    switch (model.name) {
      case 'gpt-3.5-turbo':
      case 'gpt-3.5-turbo-16k':
      case 'gpt-4': {
        if (!model.apiKey) {
          //this.logger.warn(`Missing API key for ${model.name} model`);
          throw new LLMApiKeyMissingError(model.name);
        }
        const llm = new ChatOpenAI({
          cache: true,
          maxConcurrency: 10,
          maxRetries: 3,
          modelName: model.name,
          openAIApiKey: model.apiKey,
          temperature: 0,
        });
        return llm;
      }
      default: {
        //this.logger.warn(`Model ${model.name} was not found`);
        throw new LLMNotAvailableError(model.name);
      }
    }
  }
}
