export class LLMNotAvailableError extends Error {
  constructor(model = '') {
    super(`Model ${model} is not available.`);
  }
}

export class PromptTemplateFormateError extends Error {
  constructor() {
    super(`Prompt template could not be formatted with provided chain values.`);
  }
}

export class RefinePromptInputVaribalesError extends Error {
  constructor(promptTemplate: string, missingInputVariables: string) {
    super(
      `${promptTemplate} is missing mandatory input variable: ${missingInputVariables}`,
    );
  }
}

export class RefineReservedChainValuesError extends Error {
  constructor(value: string) {
    super(`Reserved chain value ${value} cannot be used as an input variable.`);
  }
}

export class LLMApiKeyMissingError extends Error {
  constructor(model = '') {
    super(`API key for model ${model} is missing.`);
  }
}

export class LLMApiKeyInvalidError extends Error {
  constructor(model = '') {
    super(`API key for model ${model} is invalid.`);
  }
}

export class LLMBadRequestReceivedError extends Error {
  constructor(model = '') {
    super(
      `Bad Request for model ${model}, the input may be too long for the context window of the model.`,
    );
  }
}
