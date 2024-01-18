export class PdfSizeError extends Error {
  constructor() {
    super('The PDF file is larger than 5MB');
  }
}

export class PdfNotParsedError extends Error {
  constructor() {
    super(
      'The PDF file could not be parsed. It may not contain plain text or information in text format.',
    );
  }
}
