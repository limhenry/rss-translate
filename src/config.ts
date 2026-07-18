import dotenv from 'dotenv';

dotenv.config();

export const config = {
  logging: process.env.LOGGING === 'true',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
  },
};
