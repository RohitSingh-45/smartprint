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

## Sprint 4 — PDF preview engine

- [x] Serve validated PDF content from existing uploads
- [x] PDF.js viewer with lazy pages, zoom, fit-width, skeletons, errors
- [x] Auto-open preview after successful PDF upload

## Sprint 5 — Print configuration engine

- [x] Page-wise Color / B&W (default B&W)
- [x] Copies, page range, paper size, orientation
- [x] Live print summary + estimated cost + smart warnings

## Sprint 6 — Order draft engine

- [x] Draft CRUD APIs with 15-minute expiration
- [x] Auto-sync draft from print configuration
- [x] Restore draft on refresh + countdown UI
- [x] Architecture ready for payment handoff

## Sprint 7 — Payments

- [x] Checkout flow using draft id (Razorpay + local mock provider)
- [x] Server-side signature verification (never trust frontend status)
- [x] Convert draft → paid order (`status: PAID`)
- [x] Payment / processing / success / failed / confirmation screens
- [x] Reject expired, missing, mismatched, invalid, and duplicate payments

## Sprint 8 — Shop owner dashboard

- [x] Dashboard summary cards (revenue, orders, pending/paid/ready/completed/cancelled)
- [x] Orders list with search, status filters, and date range
- [x] Order detail + timeline + shop actions (accept / reject / ready / cancel)
- [x] Validated status transitions (no invalid jumps)
- [x] Printer status placeholder widget (UI-only pause/resume)

## Sprint 9 — Printers, queue & QR jobs

- Printer registration & connectivity
- QR code generation for print stations
- Job dispatch to connected printers (consume `READY` orders)
- Job status tracking / print queue
- Mark completed after physical print

## Sprint 10 — Hardening & launch prep

- Observability, rate limiting, security review
- E2E tests + deployment pipelines
- Auth foundation when accounts are required
