import { ApiProperty } from '@nestjs/swagger';

export class ChainCall {
  @ApiProperty({
    description: 'name of the chain',
  })
  chainName: string;
  @ApiProperty({
    description: 'runId of the chain',
  })
  runId: string;
  @ApiProperty({
    description: 'start of the chain',
    type: 'object',
    properties: {
      inputs: {
        description: 'inputs of the chain',
        type: 'object',
      },
    },
  })
  start: {
    inputs: any;
  };
  @ApiProperty({
    description: 'end of the chain',
    type: 'object',
    properties: {
      outputs: {
        description: 'outputs of the chain',
        type: 'object',
      },
    },
  })
  end: {
    outputs: any;
  };
  @ApiProperty({
    description: 'error of the chain',
    type: 'object',
    properties: {
      err: {
        type: 'object',
      },
    },
  })
  error: {
    err: any;
  };
}

export class LlmCall {
  @ApiProperty({
    description: 'name of the llm',
  })
  llmName: string;
  @ApiProperty({
    description: 'runId of the parent chain',
    nullable: true,
  })
  parentRunId?: string;
  @ApiProperty({
    description: 'runId of the llm',
  })
  runId: string;
  @ApiProperty({
    description: 'start of the llm chain',
    type: 'object',
    properties: {
      prompts: {
        description: 'prompts used for the call.',
        type: 'object',
      },
    },
  })
  start: {
    prompts: any;
  };
  @ApiProperty({
    description: 'end of the llm chain',
    type: 'object',
    properties: {
      outputs: {
        description: 'output of the call.',
        type: 'object',
      },
    },
  })
  end: {
    outputs: any;
  };
  @ApiProperty({
    description: 'error of the llm chain',
    type: 'object',
    properties: {
      err: {
        type: 'object',
      },
    },
  })
  error: {
    err: any;
  };
}

export class DebugReport {
  @ApiProperty({
    description: 'number of chains created',
  })
  chainCallCount: number;
  @ApiProperty({
    description: 'number of calls to the model',
  })
  llmCallCount: number;
  @ApiProperty({
    description: 'array of created chains',
    type: [ChainCall],
  })
  chains: ChainCall[];
  @ApiProperty({
    description: 'array of calls to the model',
    type: [LlmCall],
  })
  llms: LlmCall[];
}
