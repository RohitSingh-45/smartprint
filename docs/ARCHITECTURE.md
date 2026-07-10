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
- **Health surface:** `GET /api/health` (readiness; 503 if DB down), `GET /api/health/live` (liveness)
- **Hardening:** Zod env validation, Helmet, Morgan, JSON body limit, graceful shutdown; production exits if MongoDB is unreachable

## Data

Sprint 1 establishes a MongoDB connection only. Domain persistence for early sprints uses local JSON stores (uploads, drafts, paid orders) behind service interfaces so Mongo models can replace them later.

### Payment flow (Sprint 7)

```text
Draft (valid, not expired)
  → POST /api/payments/checkout  (Razorpay/mock order + payment intent)
  → Client checkout (Razorpay.js or mock UI)
  → POST /api/payments/verify    (HMAC signature; never trust client status)
  → PaidOrder status=PAID        (print snapshot stored; no printer dispatch yet)
```

Failed / cancelled payments leave the draft alive until TTL. Duplicate paid conversions are rejected.

### Shop order lifecycle (Sprint 8)

```text
PaidOrder status=PAID
  → shop accept  → ACCEPTED
  → shop reject  → REJECTED
  → shop cancel  → CANCELLED
ACCEPTED
  → mark_ready   → READY   (ready for future printer dispatch)
  → cancel       → CANCELLED
READY
  → cancel       → CANCELLED
COMPLETED is reserved for Sprint 9 after physical print.
```

Shop APIs live under `/api/shop/*` and stay independent of printer hardware.

## Packages

`packages/` is reserved for shared libraries (types, UI kit, config) when cross-app reuse is needed.

## Local ports

| Service | Default port |
| ------- | ------------ |
| Web     | 3000         |
| API     | 4000         |
| MongoDB | 27017        |
