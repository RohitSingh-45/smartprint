# SmartPrint Roadmap

## Sprint 1 — Project initialization

- [x] Monorepo with npm workspaces
- [x] Next.js App Router + TypeScript + Tailwind (`apps/web`)
- [x] Express + TypeScript API (`apps/api`)
- [x] MongoDB connection (no models)
- [x] ESLint, Prettier, environment templates
- [x] Git ignore, README, docs

## Sprint 2 — User flow & UI foundation (current)

- [x] Landing page
- [x] QR entry → upload → preview → color/B&W → price → payment → queue → complete
- [x] Error state screens (printer / payment / upload)
- [x] Admin dashboard layout (sidebar + topbar)
- [x] Dark mode + reusable components (UI only, no backend)

## Sprint 3 — Auth + real upload wiring

- User registration / login (email + password)
- JWT session strategy
- Protected API middleware
- User Mongoose model
- Real PDF / DOCX / image upload API
- Persist page Color / B&W selections on a job draft
- Shared frontend API client

## Sprint 4 — Payments

- Checkout flow
- Payment provider integration
- Order / payment records
- Receipt / confirmation UI

## Sprint 5 — Printers & QR jobs

- Printer registration & connectivity
- QR code generation for print stations
- Job dispatch to connected printers
- Job status tracking

## Sprint 6 — Hardening & launch prep

- Observability (logging, metrics)
- Rate limiting & security review
- E2E tests for core flows
- Deployment pipelines
