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

## Sprint 9 — Queue management engine

- [x] FIFO print queue with hold / resume / reorder
- [x] Status flow: PAID → ACCEPTED → QUEUED → READY_FOR_PRINT (+ HELD / CANCELLED)
- [x] Queue summary, search, filters
- [x] `listReadyForPrintJobs()` intake interface for Sprint 10
- [x] PRINTING / COMPLETED statuses reserved (no printer I/O)

## Sprint 10 — Local Print Agent & printer integration

- [x] Local Print Agent (`apps/print-agent`) with token auth
- [x] Printer registration + heartbeat + status model
- [x] Consume READY_FOR_PRINT → PRINTING → COMPLETED / FAILED
- [x] Retry / reprint / cancel printing
- [x] Admin Printers dashboard
- [ ] QR code generation for print stations (deferred — see TECHNICAL_DEBT)

## Sprint 11 — Hardening, student status & launch prep

- Student-facing live job status (printing / ready to collect)
- Observability, rate limiting, security review
- E2E tests + deployment pipelines
- Auth foundation when accounts are required
- Optional: QR station pairing for multi-printer shops
