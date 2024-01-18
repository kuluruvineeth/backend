import { BaseCallbackHandler } from 'langchain/callbacks';
import { ChainCall, DebugReport, LlmCall } from '../dto/debug.dto';
import { ChainValues, LLMResult } from 'langchain/schema';
import { Serialized } from 'langchain/load/serializable';

export class DebugCallbackHandler extends BaseCallbackHandler {
  name = 'DebugCallbackHandler';

  private _debugReport: DebugReport;
  private _chainCallCount = 0;
  private _llmCallCount = 0;

  get debugReport() {
    return this._debugReport;
  }

  async handleChainStart(
    chain: Serialized,
    inputs: ChainValues,
    runId: string,
  ): Promise<void> {
    const startedChain: ChainCall = {
      chainName: chain.id.at(-1),
      runId,
      start: {
        inputs,
      },
      end: {
        outputs: null,
      },
      error: {
        err: null,
      },
    };

    this._debugReport = {
      chainCallCount: ++this._chainCallCount,
      llmCallCount: this._llmCallCount,
      chains: [...(this._debugReport?.chains ?? []), startedChain],
      llms: [...(this._debugReport?.llms ?? [])],
    };
  }

  async handleChainEnd(outputs: ChainValues, runId: string): Promise<void> {
    const endedChain = this._debugReport.chains.find(
      (chain) => chain.runId === runId,
    );

    endedChain.end.outputs = outputs;
  }

  async handleChainError(err: any, runId: string): Promise<void> {
    const erroredChain = this._debugReport.chains.find(
      (chain) => chain.runId === runId,
    );

    erroredChain.error.err = err;
  }

  async handleLLMStart(
    llm: Serialized,
    prompts: string[],
    runId: string,
    parentRunId?: string,
  ): Promise<void> {
    const startedLlmCall: LlmCall = {
      llmName: llm.id.at(-1),
      parentRunId,
      runId,
      start: {
        prompts,
      },
      end: {
        outputs: null,
      },
      error: {
        err: null,
      },
    };

    this._debugReport = {
      chainCallCount: this._chainCallCount,
      llmCallCount: ++this._llmCallCount,
      chains: [...(this._debugReport?.chains ?? [])],
      llms: [...(this._debugReport?.llms ?? []), startedLlmCall],
    };
  }

  async handleLLMEnd(output: LLMResult, runId: string): Promise<void> {
    const endedLlmCall = this._debugReport.llms.find(
      (llmCall) => llmCall.runId === runId,
    );

    endedLlmCall.end.outputs = output;
  }

  async handleLLMError(err: any, runId: string): Promise<void> {
    const erroredLlmCall = this._debugReport.llms.find(
      (llmCall) => llmCall.runId === runId,
    );

    erroredLlmCall.error.err = err;
  }
}
