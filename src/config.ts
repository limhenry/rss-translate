import dotenv from 'dotenv';

dotenv.config();

export const config = {
  logging: process.env.LOGGING === 'true',
  provider: process.env.TRANSLATE_PROVIDER || 'google_basic',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    projectId: process.env.GOOGLE_PROJECT_ID,
    location: process.env.GOOGLE_LOCATION,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
};
