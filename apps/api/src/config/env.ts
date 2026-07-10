import dotenv from 'dotenv';
import { resolve } from 'path';
import { z } from 'zod';

dotenv.config({ path: resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z
    .string()
    .min(1, 'MONGODB_URI is required')
    .default('mongodb://127.0.0.1:27017/smartprint'),
  CORS_ORIGIN: z.string().url('CORS_ORIGIN must be a valid URL').default('http://localhost:3000'),
  JSON_BODY_LIMIT: z.string().default('100kb'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[env] Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.') || 'env'}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  mongodbUri: parsed.data.MONGODB_URI,
  corsOrigin: parsed.data.CORS_ORIGIN,
  jsonBodyLimit: parsed.data.JSON_BODY_LIMIT,
  isProduction: parsed.data.NODE_ENV === 'production',
} as const;
