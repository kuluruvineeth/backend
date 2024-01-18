export default () => ({
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  popplerBinariesPath: process.env.POPPLER_BIN_PATH,
  openaiApiKey: process.env.OPENAI_API_KEY,
  logLevel: process.env.LOG_LEVEL?.split(',').map((l) => l.trim()) || [
    'log',
    'warn',
    'error',
  ],
});
