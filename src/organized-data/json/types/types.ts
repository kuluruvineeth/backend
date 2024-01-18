export type RefineParams = {
  chunkSize: number;
  overlap: number;
};

export type RefineRecap = RefineParams & {
  llmCallCount: number;
};
