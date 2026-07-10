import cors from 'cors';
import express from 'express';
import type { Server } from 'http';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './routes';

let server: Server | undefined;
let isShuttingDown = false;

async function bootstrap(): Promise<void> {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  app.use(express.json({ limit: env.jsonBodyLimit }));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  try {
    await connectDatabase();
  } catch (error) {
    console.error('[db] Failed to connect to MongoDB:', error);

    if (env.isProduction) {
      console.error('[db] Exiting because MongoDB is required in production.');
      process.exit(1);
    }

    console.warn('[db] API will start without an active database connection.');
  }

  await new Promise<void>((resolve, reject) => {
    server = app.listen(env.port, () => {
      console.log(`[api] SmartPrint API listening on http://localhost:${env.port}`);
      console.log(`[api] Readiness: http://localhost:${env.port}/api/health`);
      console.log(`[api] Liveness:  http://localhost:${env.port}/api/health/live`);
      resolve();
    });

    server.on('error', reject);
  });

  registerShutdownHandlers();
}

function registerShutdownHandlers(): void {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

  for (const signal of signals) {
    process.on(signal, () => {
      void shutdown(signal);
    });
  }

  process.on('uncaughtException', (error) => {
    console.error('[api] Uncaught exception:', error);
    void shutdown('uncaughtException', 1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[api] Unhandled rejection:', reason);
    void shutdown('unhandledRejection', 1);
  });
}

async function shutdown(reason: string, exitCode = 0): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`[api] Shutting down (${reason})...`);

  const forceExitTimer = setTimeout(() => {
    console.error('[api] Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
  forceExitTimer.unref();

  try {
    if (server?.listening) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      console.log('[api] HTTP server closed');
    }

    await disconnectDatabase();
    console.log('[api] Shutdown complete');
    process.exit(exitCode);
  } catch (error) {
    console.error('[api] Error during shutdown:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('[api] Failed to start:', error);
  process.exit(1);
});
