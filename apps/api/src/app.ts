import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './routes';
import { getDraftStore } from './services/draft';
import { getOrderStore } from './services/order';
import { getPrinterStore } from './services/printer';
import { getFileStorage } from './services/storage';

/**
 * Build the fully-configured Express application (middleware + routes).
 *
 * This is intentionally synchronous and free of network/process side effects:
 * it never calls `app.listen()` and never registers process-level signal / exit
 * handlers. That keeps the returned app usable BOTH as a long-running server
 * (see `index.ts`) and as a Vercel serverless handler.
 *
 * On Vercel's Node.js runtime the deployed module must EXPORT a request handler
 * (or server). An Express `app` instance is itself a `(req, res) => void`
 * handler, so exporting it (see the default export below) is exactly the format
 * Vercel expects — this is what fixes the
 * "No exports found in module ... Did you forget to export a function or a server?"
 * deployment error.
 */
export function createApp(): Express {
  const app = express();

  app.use(
    helmet({
      // Allow the Next.js app (different origin/port) to fetch PDF bytes for preview.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(cors({ origin: env.corsOrigin }));
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  app.use(express.json({ limit: env.jsonBodyLimit }));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

let servicesPromise: Promise<void> | undefined;

/**
 * Warm up local storage directories and establish the MongoDB connection.
 *
 * Memoized so it runs at most once per process / warm serverless instance.
 * Storage directories self-initialize on write, but we warm them eagerly to
 * preserve the previous startup behavior and logs.
 *
 * The database connection is BEST EFFORT: a failure is logged but never throws
 * and never calls `process.exit()`. This is essential on serverless — exiting
 * the process from within (or around) a request handler would tear down the
 * whole function instance. When the DB is unreachable the API keeps serving and
 * `/api/health` simply reports it as disconnected. Standalone servers that
 * require a database enforce that separately in `index.ts`.
 */
export function initServices(): Promise<void> {
  if (!servicesPromise) {
    servicesPromise = (async () => {
      await getFileStorage().ensureReady();
      console.log(`[uploads] Storage ready (${env.storageDriver}) → ${env.uploadDir}`);

      await getDraftStore().ensureReady();
      console.log(`[drafts] Store ready → ${env.draftDir} (TTL ${env.draftTtlSeconds}s)`);

      await getOrderStore().ensureReady();
      console.log(`[orders] Store ready → ${env.orderDir} (provider ${env.paymentProvider})`);

      await getPrinterStore().ensureReady();
      console.log(`[printers] Store ready → ${env.printerDir}`);

      try {
        await connectDatabase();
      } catch (error) {
        console.error('[db] Failed to connect to MongoDB:', error);
        console.warn('[db] API is running without an active database connection.');
      }
    })();
  }

  return servicesPromise;
}

// The configured Express app is the Vercel Node.js serverless entry point.
const app = createApp();

// Kick off service warm-up (storage + DB) without blocking the exported handler.
// Errors are fully handled inside initServices, so this never rejects.
void initServices();

// Default export = the request handler Vercel invokes for every request.
export default app;
