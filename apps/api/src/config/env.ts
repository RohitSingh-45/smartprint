import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../../.env') });

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/smartprint',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
} as const;
