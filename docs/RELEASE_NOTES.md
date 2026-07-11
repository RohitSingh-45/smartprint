# SmartPrint v1.0 Release Notes

**Version:** 1.0.0  
**Codename:** QR → Print → Pickup  
**Date:** 2026-07-11

## Summary

SmartPrint v1.0 is the first production-ready release of the QR-based campus printing workflow:

**QR Scan → Upload PDF → Preview → Configure → Pay → Queue → Print → Pickup**

No accounts, no multi-shop tenancy, no notifications — one workflow done well.

## What's included

- Customer print journey (QR entry through live tracking & pickup QR)
- Shop dashboard (orders, FIFO queue, printers)
- Local Print Agent (token-authenticated; mock or CUPS `lp`)
- Razorpay checkout with server-side signature verification (mock provider for local/dev only)
- Server-authoritative pricing (client amounts ignored)
- Rate limiting on public and agent APIs
- Production env fail-closed guards (`PAYMENT_PROVIDER`, `PRINT_AGENT_TOKEN`, `CORS_ORIGIN`)
- PDF-only uploads with magic-byte validation
- Protected PDF content (CORS origin or agent token)
- CI: lint, typecheck, build

## Breaking changes from late MVP builds

- Uploads accept **PDF only** (DOCX/JPG/PNG removed — they could not complete the print path)
- Public `GET /api/queue/jobs/ready` removed (agent uses `/api/agent/jobs/ready`)
- `GET /api/uploads/:id/content` requires matching `Origin`/`Referer` or agent token
- Production refuses `PAYMENT_PROVIDER=mock` and weak default agent tokens

## Upgrade notes

1. Set `NODE_ENV=production`
2. Set `PAYMENT_PROVIDER=razorpay` with live/test Razorpay keys as appropriate
3. Set a strong unique `PRINT_AGENT_TOKEN` (≥24 chars) on API and print-agent
4. Set `CORS_ORIGIN` to the public web origin
5. Run `npm ci && npm run build && npm run typecheck && npm run lint`
6. Start API, web, and print-agent; verify `/api/health`

## Git tag

```bash
git tag -a v1.0.0 -m "SmartPrint v1.0.0"
git push origin v1.0.0
```
