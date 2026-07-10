# SmartPrint Roadmap

## Sprint 1 — Project initialization

- [x] Monorepo with npm workspaces
- [x] Next.js App Router + TypeScript + Tailwind (`apps/web`)
- [x] Express + TypeScript API (`apps/api`)
- [x] MongoDB connection (no models)
- [x] ESLint, Prettier, environment templates
- [x] Git ignore, README, docs

## Sprint 2 — User flow & UI foundation

- [x] Landing page
- [x] QR entry → upload → preview → color/B&W → price → payment → queue → complete
- [x] Error state screens (printer / payment / upload)
- [x] Admin dashboard layout (sidebar + topbar)
- [x] Dark mode + reusable components (UI only, no backend)

## Sprint 3 — File upload engine

- [x] Secure upload API (validate type/size, sanitize names, unique ids)
- [x] Local temp storage behind a swappable `FileStorage` interface
- [x] Frontend drag/drop + click upload with progress, details, remove/replace
- [x] Document technical debt for cloud storage and later flow steps

## Sprint 4 — PDF preview engine

- [x] Serve validated PDF content from existing uploads (`GET /api/uploads/:id/content`)
- [x] PDF.js viewer with lazy pages, zoom, fit-width, skeletons, errors
- [x] Auto-open preview after successful PDF upload
- [x] Capture preview follow-ups in `docs/TECHNICAL_DEBT.md`

## Sprint 5 — Print configuration engine (current)

- [x] Page-wise Color / B&W (default B&W)
- [x] Copies, page range, paper size, orientation
- [x] Live print summary + estimated cost + smart warnings
- [x] Session-persisted config ready for payment handoff

## Sprint 6 — Payments

- Checkout flow using saved print config
- Payment provider integration
- Order / payment records
- Receipt / confirmation UI

## Sprint 7 — Printers & QR jobs

- Printer registration & connectivity
- QR code generation for print stations
- Job dispatch to connected printers
- Job status tracking

## Sprint 8 — Hardening & launch prep

- Observability (logging, metrics)
- Rate limiting & security review
- E2E tests for core flows
- Deployment pipelines
- Auth foundation when accounts are required
