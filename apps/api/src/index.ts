import type { Server } from 'http';
import app, { initServices } from './app';
import { disconnectDatabase, isDatabaseConnected } from './config/database';
import { env } from './config/env';

/**
 * Standalone / long-running server entry point.
 *
 * This file is used by `npm run dev:api` (tsx watch) and by traditional
 * non-serverless deployments (`node dist/index.js`). It owns everything that is
 * INCOMPATIBLE with a serverless runtime and therefore must NOT live in
 * `app.ts`: binding a port with `app.listen()`, OS signal handling, and
 * `process.exit()` for graceful shutdown. Vercel imports `app.ts` instead, so
 * none of this executes there.
 */

let server: Server | undefined;
let isShuttingDown = false;

async function bootstrap(): Promise<void> {
  await initServices();

  // Preserve the original behavior for standalone production servers: if a
  // database is required but unreachable, exit so an orchestrator can restart
  // the process. (Serverless never reaches this file, so it is unaffected.)
  if (env.isProduction && !isDatabaseConnected()) {
    console.error('[db] Exiting because MongoDB is required in production.');
    process.exit(1);
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
