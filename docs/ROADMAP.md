# SmartPrint Roadmap

## Completed — v1.0 (Sprints 1–11 + release prep)

- [x] Monorepo (web / api / print-agent)
- [x] Customer flow: QR → upload → preview → configure → draft → pay → track → pickup
- [x] Shop dashboard, FIFO queue, Local Print Agent
- [x] Razorpay + mock payment (mock blocked in production)
- [x] v1.0 hardening: rate limits, PDF-only uploads, production env guards, CI, release docs

---

## Version 2 only

Do **not** mix these into v1.0 patches unless explicitly scheduled.

### Accounts & tenancy

- [ ] Customer and shop-owner authentication / RBAC
- [ ] Multi-shop / multi-station tenancy
- [ ] QR station pairing & enrollment for print agents

### Reliability & data

- [ ] Move drafts / orders / uploads / printers from JSON files to MongoDB
- [ ] Razorpay webhooks + settlement reconciliation
- [ ] Redis-backed rate limiting for multi-instance
- [ ] Signed short-lived PDF & pickup tokens
- [ ] Server-side PDF page-count extraction on upload
- [ ] Stream uploads to disk / object storage (S3)

### Product

- [ ] Real waiting-time metrics (replace placeholder ETA)
- [ ] Browser / email / WhatsApp notification adapters
- [ ] Receipt PDF download + reprint request
- [ ] SSE/WebSocket live tracking (replace polling)
- [ ] DOCX → PDF conversion; image preview gallery
- [ ] Shop-specific price tables; duplex / finishing; A3+ paper
- [ ] Priority scheduling; multi-printer queue shards

### Ops

- [ ] Observability (structured metrics / tracing)
- [ ] Expanded E2E suite beyond CI lint/typecheck/build
- [ ] Agent auto-update channel; CUPS/Windows spooler parity extras

See `docs/KNOWN_LIMITATIONS.md` and `docs/TECHNICAL_DEBT.md`.
