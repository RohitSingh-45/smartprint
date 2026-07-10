# Changelog

All notable changes to SmartPrint are documented in this file.

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
