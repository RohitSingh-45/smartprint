import dotenv from 'dotenv';
import { isAbsolute, resolve } from 'path';
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
  ORDER_DIR: z.string().min(1).default('orders'),
  PRINTER_DIR: z.string().min(1).default('printers'),
  /** Shared secret for Local Print Agent (never expose to the browser). */
  PRINT_AGENT_TOKEN: z.string().min(8).default('smartprint-dev-agent-token'),
  PAYMENT_PROVIDER: z.enum(['mock', 'razorpay']).default('mock'),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  /** Google Gemini API key — optional; required only when AI_MODE=real. */
  GEMINI_API_KEY: z.string().optional(),
  /** AI execution mode: 'real' calls Gemini, 'mock' returns deterministic demo responses. */
  AI_MODE: z.enum(['real', 'mock']).default('mock'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[env] Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.') || 'env'}: ${issue.message}`);
  }
  process.exit(1);
}

if (parsed.data.PAYMENT_PROVIDER === 'razorpay') {
  if (!parsed.data.RAZORPAY_KEY_ID || !parsed.data.RAZORPAY_KEY_SECRET) {
    console.error(
      '[env] RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required when PAYMENT_PROVIDER=razorpay',
    );
    process.exit(1);
  }
}

const WEAK_AGENT_TOKENS = new Set([
  'smartprint-dev-agent-token',
  'changeme',
  'secret',
  'password',
  'print-agent',
]);

if (parsed.data.NODE_ENV === 'production') {
  const failures: string[] = [];

  if (parsed.data.PAYMENT_PROVIDER === 'mock') {
    failures.push('PAYMENT_PROVIDER=mock is not allowed in production (use razorpay).');
  }
  if (WEAK_AGENT_TOKENS.has(parsed.data.PRINT_AGENT_TOKEN)) {
    failures.push('PRINT_AGENT_TOKEN must be a strong unique secret in production.');
  }
  if (parsed.data.PRINT_AGENT_TOKEN.length < 24) {
    failures.push('PRINT_AGENT_TOKEN must be at least 24 characters in production.');
  }
  try {
    const corsHost = new URL(parsed.data.CORS_ORIGIN).hostname;
    if (corsHost === 'localhost' || corsHost === '127.0.0.1') {
      failures.push('CORS_ORIGIN must not be localhost in production.');
    }
  } catch {
    failures.push('CORS_ORIGIN is invalid.');
  }

  if (failures.length > 0) {
    console.error('[env] Production configuration rejected:');
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }
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
  orderDir: parsed.data.ORDER_DIR,
  printerDir: parsed.data.PRINTER_DIR,
  printAgentToken: parsed.data.PRINT_AGENT_TOKEN,
  paymentProvider: parsed.data.PAYMENT_PROVIDER,
  razorpayKeyId: parsed.data.RAZORPAY_KEY_ID,
  razorpayKeySecret: parsed.data.RAZORPAY_KEY_SECRET,
  geminiApiKey: parsed.data.GEMINI_API_KEY,
  aiMode: parsed.data.AI_MODE,
  isProduction: parsed.data.NODE_ENV === 'production',
  /**
   * True when running on a serverless platform with a read-only deployment
   * filesystem (e.g. Vercel's `/var/task`). Detected from Vercel's own `VERCEL`
   * env var, or from a production `NODE_ENV` (covers other serverless targets
   * such as AWS Lambda where the same read-only constraint applies).
   */
  isServerless: Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME),
} as const;

/**
 * Resolve a base directory for local file / JSON storage.
 *
 * Why this exists: serverless runtimes like Vercel deploy the application bundle
 * to a READ-ONLY filesystem (`/var/task`). Creating or writing directories
 * relative to `process.cwd()` there throws `ENOENT` / `EROFS` and crashes the
 * process on startup (`LocalFileStorage.ensureReady` -> `fs.mkdir`). The only
 * writable location in that runtime is the ephemeral `/tmp` volume, so in
 * serverless/production we root relative storage paths under `/tmp`.
 *
 * In development we keep resolving against the project working directory so the
 * existing local `uploads/`, `drafts/`, `orders/`, `printers/` folders behave
 * exactly as before.
 *
 * Absolute paths are always honored as-is, allowing operators to mount a
 * persistent volume (or point at durable storage) via the `*_DIR` env vars.
 *
 * NOTE: `/tmp` on serverless is ephemeral and not shared across invocations or
 * instances — it is only safe for transient data. Durable storage should be
 * backed by an external service (S3/DB) rather than the local filesystem.
 */
export function resolveStorageDir(dir: string): string {
  if (isAbsolute(dir)) {
    return dir;
  }

  const baseDir = env.isServerless ? '/tmp' : process.cwd();
  return resolve(baseDir, dir);
}
