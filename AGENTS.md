# AGENTS.md

## Cursor Cloud specific instructions

SmartPrint is an npm-workspaces monorepo (`apps/*`, `packages/*`). Dependencies are
installed from the repo root with a single `npm install` (this is the update script).
See `README.md` for the full command/URL/env-var tables; only non-obvious notes live here.

### Services

| Service     | Workspace                 | Dev command         | URL / port                   |
| ----------- | ------------------------- | ------------------- | ---------------------------- |
| Web         | `@smartprint/web`         | `npm run dev:web`   | http://localhost:3000        |
| API         | `@smartprint/api`         | `npm run dev:api`   | http://localhost:4000        |
| Print agent | `@smartprint/print-agent` | `npm run dev:agent` | polls the API (no HTTP port) |
| MongoDB     | (system service)          | `mongod`            | 127.0.0.1:27017              |

All three app configs default to `localhost` targets, so the apps run with no `.env`
files on this VM. Copy `apps/*/.env.example` to `.env` / `.env.local` only if you need
to override defaults (see README).

### MongoDB (installed on this VM, not started automatically)

- MongoDB 8 is installed (`mongod`, `mongosh`). It is **not** managed by systemd here.
  Start it manually before the API, e.g.:
  `mongod --dbpath /var/lib/mongodb --bind_ip 127.0.0.1 --port 27017`
- MongoDB is **optional** for the product flow: all domain data (uploads, drafts,
  orders, printers) is persisted to local JSON stores under `apps/api/{uploads,drafts,orders,printers}/`.
  Mongo only backs the readiness probe.
- Gotcha: the API connects to Mongo **once at boot**. `GET /api/health` returns `503`
  (`database: disconnected`) if Mongo was down at startup; `GET /api/health/live`
  always returns `200`. If you start Mongo _after_ the API, the API will not
  auto-reconnect — **restart `npm run dev:api`**. Start Mongo first to get a green `/api/health`.

### Payment & printing are mock by default

- `PAYMENT_PROVIDER=mock` (default) enables full end-to-end checkout with no Razorpay
  keys — the payment modal has a "simulate success" action.
- The print agent runs in `PRINT_MODE=mock` (default): it registers mock printers,
  polls `READY_FOR_PRINT` jobs every ~3s, "prints" to `apps/print-agent/agent-jobs/`,
  and marks them completed. No physical printer or CUPS needed.

### Lint / typecheck / build

- `npm run lint` fails on `@smartprint/print-agent` because that workspace has a `lint`
  script but no `eslint.config.*` file (pre-existing repo gap). `api` and `web` lint
  cleanly. For the print agent, use `npm run typecheck -w @smartprint/print-agent`.
- `npm run build` builds all three workspaces (api/agent via `tsc`, web via `next build`).

### End-to-end smoke flow

Customer: `/print/upload` → upload PDF → preview → configure → summary → mock pay →
confirmation → `/print/status` tracking. Shop: `/admin/orders` accept → move to queue →
`/admin/queue` mark ready for print → the print agent claims and completes it →
`/admin/printers` shows the completed job.
