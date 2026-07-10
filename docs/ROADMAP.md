# SmartPrint Roadmap

## Sprint 1 — Project initialization (current)

- [x] Monorepo with npm workspaces
- [x] Next.js App Router + TypeScript + Tailwind (`apps/web`)
- [x] Express + TypeScript API (`apps/api`)
- [x] MongoDB connection (no models)
- [x] ESLint, Prettier, environment templates
- [x] Git ignore, README, docs

## Sprint 2 — Auth foundation & API scaffolding

- User registration / login (email + password)
- JWT session strategy
- Protected API middleware
- User Mongoose model
- Basic auth UI pages (sign in / sign up)
- Shared API client on the frontend

## Sprint 3 — File upload & page selection

- PDF / DOCX / image upload
- Page preview & Color vs B&W selection
- Job draft persistence
- Storage strategy (local or object storage)

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
