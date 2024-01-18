export class InvalidJsonOutputError extends Error {
  constructor() {
    super('The output is not valid JSON');
  }
}
