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

### Shop order lifecycle (Sprint 8–9)

```text
PaidOrder status=PAID
  → accept   → ACCEPTED
  → reject   → REJECTED
  → cancel   → CANCELLED
ACCEPTED
  → enqueue  → QUEUED   (FIFO position assigned)
QUEUED
  → hold                 → HELD
  → move_up / move_down  (reorder positions)
  → mark_ready_for_print → READY_FOR_PRINT
  → cancel               → CANCELLED
HELD
  → resume → QUEUED (appended to end)
  → cancel → CANCELLED
READY_FOR_PRINT
  → agent claim → PRINTING → COMPLETED
                 ↘ FAILED (retry → READY_FOR_PRINT)
                 ↘ CANCELLED (cancel mid-print)
COMPLETED
  → customer pickup QR (pickupCode + pickupToken)
  → shop collect → COLLECTED
  → reprint → READY_FOR_PRINT
```

Shop APIs: `/api/shop/*`. Queue APIs: `/api/queue/*`.
Agent APIs: `/api/agent/*` (token). Shop printer view: `/api/printers/*`.
Customer tracking: `/api/tracking/*` (read order/queue; collect via pickup token).

### Customer tracking (Sprint 11)

```text
PaidOrder (internal statuses)
  → CustomerTrackingView (PAYMENT_RECEIVED … COLLECTED)
  → /print/status polls GET /api/tracking/orders/:id
  → READY_FOR_PICKUP exposes pickup QR → /admin/pickup/:token
  → POST collect → COLLECTED (409 if already collected)
```

Tracking is independent of printer I/O: it only reads order + queue fields and writes `COLLECTED`.
Notification channels are stubbed in the DTO and `docs/NOTIFICATIONS.md`.

### Local Print Agent (Sprint 10)

```text
Browser / Admin UI
    │  (never talks to printers)
    ▼
SmartPrint API  ──X-Agent-Token──►  Local Print Agent (shop PC)
                                         │
                                         ▼
                                   OS spooler (CUPS lp / mock)
```

Agent package: `apps/print-agent`. Multi-printer registration is supported per agent.

## Packages

`apps/print-agent` is the Local Print Agent. `packages/` remains reserved for shared libraries.

## Local ports

| Service | Default port |
| ------- | ------------ |
| Web     | 3000         |
| API     | 4000         |
| MongoDB | 27017        |
