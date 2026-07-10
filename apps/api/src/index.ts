import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { connectDatabase } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './routes';

async function bootstrap(): Promise<void> {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  try {
    await connectDatabase();
  } catch (error) {
    console.error('[db] Failed to connect to MongoDB:', error);
    console.warn('[db] API will start without an active database connection.');
  }

  app.listen(env.port, () => {
    console.log(`[api] SmartPrint API listening on http://localhost:${env.port}`);
    console.log(`[api] Health check: http://localhost:${env.port}/api/health`);
  });
}

bootstrap().catch((error) => {
  console.error('[api] Failed to start:', error);
  process.exit(1);
});
