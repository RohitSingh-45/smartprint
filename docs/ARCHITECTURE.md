# SmartPrint Architecture

## Overview

SmartPrint is a monorepo SaaS platform for QR-based smart printing.

```text
┌─────────────────┐         ┌─────────────────┐         ┌────────────┐
│  apps/web       │  HTTP   │  apps/api       │         │  MongoDB   │
│  Next.js        │ ──────► │  Express        │ ──────► │            │
│  App Router     │         │  TypeScript     │         │            │
└─────────────────┘         └─────────────────┘         └────────────┘
```

## Principles

- **Monorepo first** — frontend and backend share tooling and release cadence.
- **Thin Sprint 1** — structure and connectivity only; no domain features yet.
- **Clear boundaries** — UI in `apps/web`, HTTP/API in `apps/api`, data in MongoDB.
- **Config via env** — no secrets in source; `.env.example` documents required keys.

## Applications

### `apps/web` (Frontend)

- **Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Role:** User-facing UI (auth, upload, checkout, job status — future sprints)
- **Talks to:** `NEXT_PUBLIC_API_URL` (Express API)

### `apps/api` (Backend)

- **Stack:** Node.js, Express, TypeScript, Mongoose
- **Role:** REST API, auth, uploads, payments, printer orchestration (future)
- **Data:** MongoDB via `MONGODB_URI`
- **Sprint 1 surface:** `GET /api/health`

## Data

Sprint 1 establishes a MongoDB connection only. Models (User, Job, Payment, Printer, etc.) are deferred to later sprints.

## Packages

`packages/` is reserved for shared libraries (types, UI kit, config) when cross-app reuse is needed.

## Local ports

| Service | Default port |
| ------- | ------------ |
| Web     | 3000         |
| API     | 4000         |
| MongoDB | 27017        |
