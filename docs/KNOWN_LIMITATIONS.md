# Known Limitations — SmartPrint v1.0

These are intentional or deferred constraints for the v1.0 single-workflow release.

## Product / workflow

- **No authentication** for customers or shop operators (local trust model)
- **Single demo station** after QR entry (`DEFAULT_STATION`); not live multi-station pairing
- **PDF only** — DOCX/JPG/PNG are out of scope for v1 print path
- **Hardcoded demo rates** (₹2 B&W / ₹8 color) shared by web + API
- **A4 only**; duplex / finishing options not available
- **Pickup collect** is unauthenticated by design (counter scan flow)
- **Order history** is device-local (`localStorage`), not account-backed
- **Notifications** (browser / email / WhatsApp) are stubs — nothing is sent
- **Queue ETA** is a placeholder formula, not historical metrics

## Platform / ops

- **Orders, drafts, uploads, printers** persist as local JSON/files (not MongoDB documents)
- **MongoDB** is required for API readiness/health but unused for business data
- **Rate limits** are in-memory (single process); multi-instance needs Redis
- **No Razorpay webhooks** — reconciliation relies on client verify + signature
- **PDF `totalPages`** still originates from client preview (bounded + validated); server does not re-parse page count yet
- **Multer memory storage** buffers whole uploads in RAM
- **Print agent** processes one job at a time (`busy` flag)

## Security (documented for v2)

- Shop / queue / printer admin APIs are unauthenticated
- Pickup tokens are UUIDs (not short-lived signed tokens)
- No virus scanning on uploads

See also `docs/TECHNICAL_DEBT.md` and `docs/ROADMAP.md` (Version 2).
