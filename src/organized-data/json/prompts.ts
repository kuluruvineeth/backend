import { PromptTemplate } from 'langchain/prompts';

const jsonZeroShotSchemaExtractionTemplate = `
You are a highly efficient text processing application
Your main objective is to accurately parse the user's input text and transform it into a JSON object that compiles with the schema provided below.
-------------------
JSON schema:
{jsonSchema}
-------------------
Please generate the output JSON object containing the necessary information and ensure it follows the given schema.
If the input text contains any attributes not mentioned in the schema, please disregard them.
-------------------
Input:
{context}
-------------------
Output:
`;

const jsonZeroShotSchemaExtractionRefineTemplate = `
You are a highly efficient text processing application
Your main objective is to accurately parse the user's input text and transform it into a JSON object that compiles with the schema provided below.
-------------------
JSON schema:
{jsonSchema}
-------------------
You have provided an existing output:
{existing_answer}

We have the opportunity to refine the existing output (only if needed) with some context below.
-------------------
Context:
{context}
-------------------
Given the new context, refine the original output to give a better answer.
If the context isn't useful, return the existing output.

Please generate the output JSON object containing the necessary information and ensure it follows the given schema.
If the input text contains any attributes not mentioned in the schema, please disregard them.
Do not add any fields that are not in the schema.
Your outputs must ONLY be in JSON format and follow the schema specified above.
`;

const jsonOneShotExtractionTemplate = `
You are a highly efficient text processing application
Your main objective is to accurately parse the user's input text and transform it into a JSON object that compiles with the schema provided below.
------------------
Example Input:
{exampleInput}

Example Output:
{exampleOutput}
-------------------
Please generate the output JSON object containing the necessary information and ensure it follows the given schema.
If the input text contains any attributes not mentioned in the schema, please disregard them.
-------------------
Input:
{context}
-------------------
Output:
`;

const jsonAnalysisTemplate = `
You are a highly efficient text processing application

Given the original unstructured text, the JSON schema, and the generated JSON output, analyze and identify any discrepancies, errors, or inconsistences.
Specifically, pinpoint the parts in the original text that may have led to incorrect output in the generated JSON.
Please provide a list of fields in the generated JSON that need to be corrected, and the corresponding suggestions for corrections.
If you think the generated JSON is correct, please do not provide any suggestions.
-------------------
JSON schema:
{jsonSchema}
------------------
Original text:
{originalText}
-------------------
Generated JSON output:
{jsonOutput}
-------------------

Please output your analysis in the following json format

{outputFormat}

Your analysis:
`;

const jsonClassificationTemplate = `
Given a list of possible categories and the text to classify, use your capabilities to determine the most fitting category for the provided text.
If the category cannot be determined with high confidence, classify the text as "other".
The categories you may choose from are STRICTLY limited to the given list.
-------------------
List of possible categories with their descriptions:
{categories}
------------------
Text to classify:
{text}
-------------------
For your output, provide a JSON object that contains the 'classification' field representing the determined category and the 'confidence' field
indicating the confidence level of the classification.

Please provide your output in the following format:

{outputFormat}

Your Classification:
`;

export const jsonZeroShotSchemaExtraction = new PromptTemplate({
  inputVariables: ['context', 'jsonSchema'],
  template: jsonZeroShotSchemaExtractionTemplate,
});

export const jsonZeroShotSchemaExtractionRefine = new PromptTemplate({
  inputVariables: ['jsonSchema', 'context', 'existing_answer'],
  template: jsonZeroShotSchemaExtractionRefineTemplate,
});

export const jsonOneShotExtraction = new PromptTemplate({
  inputVariables: ['exampleInput', 'exampleOutput', 'context'],
  template: jsonOneShotExtractionTemplate,
});

export const jsonAnalysis = new PromptTemplate({
  inputVariables: ['jsonSchema', 'originalText', 'jsonOutput', 'outputFormat'],
  template: jsonAnalysisTemplate,
});

export const jsonClassification = new PromptTemplate({
  inputVariables: ['categories', 'text', 'outputFormat'],
  template: jsonClassificationTemplate,
});
