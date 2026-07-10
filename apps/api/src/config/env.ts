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
  UPLOAD_DIR: z.string().min(1).default('uploads'),
  /** Max upload size in bytes (default 25 MB). */
  UPLOAD_MAX_BYTES: z.coerce
    .number()
    .int()
    .positive()
    .max(100 * 1024 * 1024)
    .default(25 * 1024 * 1024),
  STORAGE_DRIVER: z.enum(['local']).default('local'),
  DRAFT_DIR: z.string().min(1).default('drafts'),
  /** Draft lifetime in seconds (default 15 minutes). */
  DRAFT_TTL_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .max(60 * 60)
    .default(15 * 60),
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
  uploadDir: parsed.data.UPLOAD_DIR,
  uploadMaxBytes: parsed.data.UPLOAD_MAX_BYTES,
  storageDriver: parsed.data.STORAGE_DRIVER,
  draftDir: parsed.data.DRAFT_DIR,
  draftTtlSeconds: parsed.data.DRAFT_TTL_SECONDS,
  isProduction: parsed.data.NODE_ENV === 'production',
} as const;
