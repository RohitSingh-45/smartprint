# Technical Debt

Deferred work for Version 2+. Do not implement unless explicitly scheduled.

## Upload / storage

- [ ] Swap `STORAGE_DRIVER=local` for AWS S3 or Cloudinary via the `FileStorage` interface
- [ ] Virus / malware scanning before accepting files
- [x] Rate-limit `/api/uploads`
- [x] PDF `%PDF-` magic-byte check on upload + preview
- [x] Origin / agent-token gate on `/api/uploads/:id/content` (signed URLs still deferred)
- [ ] TTL cleanup job for orphaned temp uploads
- [ ] Stream uploads to disk instead of buffering entire files in memory (multer memoryStorage)
- [ ] Authenticated uploads (tie files to a user/session) once auth exists
- [ ] Persist upload metadata in MongoDB instead of sidecar `.meta.json` files
- [ ] Range-request / streaming PDF content for very large files

## PDF preview

- [ ] Server-side page-count extraction cached on upload
- [ ] Thumbnail strip / jump-to-page navigation
- [ ] Text-layer selection for accessibility beyond canvas
- [ ] DOCX → PDF conversion for preview parity
- [ ] Image preview gallery for JPG/PNG uploads
- [ ] Password prompt flow for protected PDFs (currently blocked with error)
- [ ] Virtualize page list more aggressively (unmount offscreen canvases)

## Print configuration / drafts

- [x] Persist print config to API draft (Sprint 6 local JSON store)
- [ ] Move drafts from local JSON files to MongoDB
- [ ] Background sweeper to delete expired draft files
- [ ] Sliding TTL on draft update (currently fixed from creation)
- [ ] Configure color/B&W by tapping pages directly on the PDF preview canvases
- [ ] Duplex / single-sided toggle
- [ ] Staple / punch finishing options
- [ ] Shop-specific price tables (per station) instead of hardcoded demo rates
- [ ] Enable A3 / Letter / Legal when shop inventory supports them
- [ ] N-up (2-up / 4-up) layout options
- [ ] Remember last-used settings per student device

## Product flow

- [x] Real payment capture using draft id + upload id (Sprint 7)
- [x] Convert draft → paid order atomically (Sprint 7 local store)
- [x] Shop owner review dashboard for paid orders (Sprint 8)
- [x] Print queue engine to READY_FOR_PRINT (Sprint 9)
- [x] Local Print Agent dispatch READY_FOR_PRINT → COMPLETED/FAILED (Sprint 10)
- [x] Student-facing live print / pickup status (Sprint 11)
- [x] Mark completed + pickup code after print (Sprint 11 student UX)
- [ ] Real notification adapters (browser / email / WhatsApp)
- [ ] Receipt PDF download + reprint request
- [ ] SSE/WebSocket push for tracking instead of polling

## Print agent (deferred)

- [ ] QR code pairing for print stations / multi-shop agent enrollment
- [x] Rate-limit `/api/agent/*` (per-shop token rotation deferred)
- [ ] Signed short-lived URLs for PDF download (v1 uses Origin/agent gate)
- [ ] Windows Print Spooler + macOS CUPS parity beyond Linux `lp`
- [ ] Automatic toner/paper sensors from printer SNMP/IPP
- [ ] Agent auto-update channel

## Queue (deferred)

- [ ] Priority scheduling (field reserved, always 0 today)
- [ ] Real average waiting-time metrics from historical queue events
- [ ] Multi-station / multi-printer queue shards
- [ ] Optimistic locking for concurrent reorder
- [x] Rate-limit `/api/queue/*`

## Shop dashboard (deferred)

- [ ] Shop owner authentication / role-based access
- [ ] Multi-shop / multi-station tenancy
- [ ] Real printer telemetry extras beyond agent heartbeat
- [ ] Refunds from rejected/cancelled paid orders
- [ ] Export orders CSV / daily settlement report
- [ ] Live updates (SSE/WebSocket) when new paid orders arrive
- [x] Rate-limit `/api/shop/*`

## Tracking / pickup (deferred)

- [ ] Authenticated customer order history (replace device-localStorage)
- [x] Pickup expiry enforced on collect (signed short-lived tokens still deferred)
- [ ] Shop-side pickup scanner camera UI
- [ ] SMS fallback for pickup code

## Payments (deferred)

- [ ] Razorpay webhooks for async capture / reconciliation
- [ ] Move paid orders + payment intents from local JSON to MongoDB
- [ ] Refunds / partial refunds API
- [x] Idempotency on checkout (reuse open intent for same draft + amount)
- [x] Rate-limit `/api/payments/*`
- [ ] Settlement / receipt PDF download
- [ ] Multi-currency (currently INR only)

## Platform

- [x] CI pipeline (lint, typecheck, build)
- [ ] Upload/preview/config smoke E2E tests
- [ ] Structured logging (Pino) with request IDs
- [x] Production env fail-closed defaults (mock payment / weak agent token / localhost CORS)
