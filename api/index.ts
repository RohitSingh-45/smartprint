/**
 * Vercel serverless function entry point.
 *
 * Vercel auto-detects files inside the root `api/` directory as Node.js
 * Serverless Functions. Their mere presence is what makes Vercel deploy this
 * repository as an API rather than misdetecting it as a static site (which is
 * what caused the `No Output Directory named "public"` build failure).
 *
 * This module simply re-exports the configured Express app from `apps/api`.
 * An Express instance is itself a `(req, res) => void` handler — exactly the
 * format Vercel's Node.js runtime expects as a default export. Every incoming
 * path is routed here by the `rewrites` rule in `vercel.json`, so the Express
 * router (mounted under `/api/*`) handles all requests.
 *
 * Local development is unaffected: `npm run dev:api` still runs
 * `apps/api/src/index.ts`, which starts the standalone long-running HTTP server.
 */
import app from '../apps/api/src/app';

export default app;
