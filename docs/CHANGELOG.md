# Changelog

All notable changes to SmartPrint are documented in this file.

## [0.11.0] — 2026-07-10

### Added

- Customer live order tracking (`GET /api/tracking/orders/:id`) with mapped statuses:
  `PAYMENT_RECEIVED → ORDER_ACCEPTED → IN_QUEUE → PRINTING → READY_FOR_PICKUP → COLLECTED`
- Live timeline, queue position / placeholder ETA, order details, and error states
  (cancelled, printer failure, delayed, expired pickup, unknown)
- Pickup QR + short code when print completes; shop collect via
  `GET/POST /api/tracking/pickup/:token` and `/admin/pickup/[token]`
- Duplicate collection blocked (`409 ALREADY_COLLECTED`)
- Order history on-device (`/print/orders`) with disabled receipt/reprint placeholders
- Notification channel architecture stub (`docs/NOTIFICATIONS.md`) — no integrations
- Order status `COLLECTED` with `pickupCode` / `pickupToken` / `collectedAt`

### Changed

- `/print/status` and `/print/complete` use live tracking instead of mock data
- Confirmation screen links to live tracking after payment

## [0.10.0] — 2026-07-10

### Added

- Local Print Agent (`apps/print-agent`) — polls READY_FOR_PRINT, downloads PDF, sends to OS spooler (mock or CUPS `lp`)
- Agent APIs under `/api/agent/*` authenticated with `PRINT_AGENT_TOKEN` / `X-Agent-Token`
- Printer registration, heartbeat, claim job, update status, retry, reprint, cancel
- Shop printer dashboard APIs under `/api/printers/*`
- Order statuses `PRINTING`, `COMPLETED`, `FAILED` with print attempt metadata
- Admin `/admin/printers` page (connected printers, current job, failed, recent)

### Security

- Browser never receives the agent token and never talks to printers directly

## [0.9.0] — 2026-07-10

### Added

- Queue management engine: `GET /api/queue/summary`, `GET /api/queue/jobs`, `GET /api/queue/jobs/:id`, `POST /api/queue/jobs/:id/actions`, `GET /api/queue/jobs/ready`
- FIFO queue positions with hold / resume / move up / move down
- Status flow `PAID → ACCEPTED → QUEUED → READY_FOR_PRINT` (+ `HELD`, `CANCELLED`; `PRINTING`/`COMPLETED` reserved)
- Admin Queue page with summary cards, search, filters, and queue actions
- `listReadyForPrintJobs()` intake interface for Sprint 10 printer dispatch

### Changed

- Shop `mark_ready` replaced by `enqueue` (accepted orders enter the queue instead of skipping it)
- Legacy `READY` status normalizes to `READY_FOR_PRINT`

## [0.8.0] — 2026-07-10

### Added

- Shop owner dashboard: summary cards for today's revenue and order pipeline counts
- Shop APIs: `GET /api/shop/dashboard`, `GET /api/shop/orders`, `GET /api/shop/orders/:id`, `POST /api/shop/orders/:id/actions`
- Order lifecycle beyond payment: `PAID → ACCEPTED → READY` (+ reject/cancel) with invalid-transition guards
- Orders list with search (order id / file name), status filters, and date range
- Order detail page: file, print config, payment, timeline, shop actions, View PDF
- Printer status placeholder widget (connection/paper/ink/jam + pause/resume UI state only)

## [0.7.0] — 2026-07-10

### Added

- Payment module: `POST /api/payments/checkout`, `POST /api/payments/verify`, `GET /api/payments/orders/:id`
- Razorpay order creation + HMAC signature verification (secret never exposed to the client)
- Local `PAYMENT_PROVIDER=mock` mode for end-to-end checkout without Razorpay keys
- Paid order store (local JSON) with draft → `PAID` conversion and print snapshot
- Frontend: payment, processing, success, failed, and order confirmation screens

### Security

- Frontend payment status is never trusted; only verified signatures create paid orders
- Duplicate payment ids are idempotent; duplicate draft conversion is rejected

## [0.6.0] — 2026-07-10

### Added

- Order draft engine: `POST/GET/PATCH/DELETE /api/drafts`
- 15-minute draft TTL with countdown UI and refresh restore
- Auto-sync draft from print configuration (create/update)

## [0.5.0] — 2026-07-10

### Added

- Print configuration engine: page Color/B&W, copies, page range, paper size, orientation
- Live print summary card with estimated cost and smart validation warnings
- Session-persisted config for payment handoff (`smartprint:print-config`)

## [0.4.0] — 2026-07-10

### Added

- PDF preview engine (PDF.js) with lazy page rendering, zoom, fit-width
- `GET /api/uploads/:id/content` — validated PDF binary for preview
- Auto-navigation to preview after successful PDF upload

## [0.3.0] — 2026-07-10

### Added

- File upload engine: `POST/GET/DELETE /api/uploads`
- Local temp storage with metadata sidecars and swappable storage interface
- Upload UI with drag/drop, progress, file details, remove/replace
- `docs/TECHNICAL_DEBT.md` for deferred cloud storage and flow work

## [0.2.0] — 2026-07-10

### Added

- Sprint 2 UI foundation: landing, QR entry, upload, preview, page mode selection, price summary, payment, order status, complete, error states, admin shell
- Shared print-flow stepper, dark mode toggle, reusable UI components, mock journey data
- Mobile-first responsive screens with clickable navigation (no backend)

## [0.1.1] — 2026-07-10

### Added

- `GET /api/health/live` liveness probe (process up; no DB check)
- Zod validation for API environment variables at startup
- Helmet security headers
- Morgan HTTP request logging
- Configurable JSON body size limit (`JSON_BODY_LIMIT`, default `100kb`)
- Graceful shutdown on `SIGINT` / `SIGTERM` (and fatal process errors)

### Changed

- `GET /api/health` is now a readiness probe: returns **503** when MongoDB is disconnected
- Production boot **exits** if MongoDB cannot connect

## [0.1.0] — 2026-07-10

### Added

- npm workspaces monorepo (`apps/web`, `apps/api`, `packages/`)
- Next.js App Router frontend with TypeScript and Tailwind CSS
- Express + TypeScript API with MongoDB connection helper
- `GET /api/health` endpoint
- ESLint (per app) and Prettier (repo root)
- Environment variable templates (`.env.example`)
- Reusable folder structure for controllers, models, components, etc.
- Documentation: README, ROADMAP, ARCHITECTURE, FEATURES, CHANGELOG
