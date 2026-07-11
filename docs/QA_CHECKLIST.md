# SmartPrint v1.0 — Manual QA Checklist

Use this before tagging a production release. Mark each item Pass / Fail / N/A.

Environment: Web URL ________  API URL ________  Agent mode: mock / cups

---

## QR Entry

- [ ] `/print/qr` loads station name, location, printer status
- [ ] Continue navigates to upload
- [ ] Mobile layout readable; dark mode toggle works

## Upload

- [ ] PDF under 25 MB uploads with progress
- [ ] Non-PDF rejected client-side and server-side
- [ ] Oversized file rejected with clear error
- [ ] Empty / corrupt non-PDF rejected
- [ ] Spoofed extension (e.g. `.pdf` that is not `%PDF-`) rejected
- [ ] Successful PDF upload redirects to preview
- [ ] Remove / replace file works

## Preview

- [ ] PDF pages render (lazy / on scroll)
- [ ] Zoom in / out / fit width
- [ ] Password-protected PDF shows friendly error
- [ ] Missing `fileId` shows empty state + link to upload
- [ ] Continue to configure works

## Print Configuration

- [ ] Page color toggles (single + all B&W / all color)
- [ ] Copies 1–20 enforced
- [ ] Page range modes (all / custom) validate bounds
- [ ] Paper locked to A4; orientation changes
- [ ] Live summary updates; warnings appear when relevant
- [ ] Large PDF (>48 pages) grid stays responsive
- [ ] Draft auto-creates / updates; countdown visible

## Draft

- [ ] Refresh restores draft within TTL
- [ ] Expired draft blocks payment with clear message
- [ ] Server price matches summary when draft present
- [ ] Draft fileName/size match uploaded file (not spoofed client values)

## Payment

- [ ] Checkout creates order for **server** `estimatedPrice`
- [ ] Double-click checkout does not create duplicate intents (idempotent reuse)
- [ ] Mock mode: success / fail / cancel paths (dev only)
- [ ] Razorpay mode: gateway opens; mock UI hidden
- [ ] Verify success → confirmation + order id
- [ ] Invalid signature → failed page
- [ ] Already-paid draft → conflict, no double charge
- [ ] Processing page redirects without error flash on failure

## Dashboard (Shop)

- [ ] Overview stats load (revenue, pending, ready, printing)
- [ ] Pipeline “Printers” shows **printing** count (not completed)
- [ ] Orders list: search, status, date filters
- [ ] Order detail: accept / reject / enqueue / cancel valid transitions only
- [ ] Invalid transition rejected

## Queue

- [ ] FIFO list shows queued / held / ready
- [ ] Hold / resume / move up / down / cancel
- [ ] Mark ready for print
- [ ] Summary counts update after actions
- [ ] Public `/api/queue/jobs/ready` returns 404 (removed)

## Print Agent

- [ ] Agent registers with valid token; rejects bad token
- [ ] Claims READY_FOR_PRINT → PRINTING → COMPLETED (mock)
- [ ] Failed job surfaces on printers dashboard; retry works
- [ ] PDF download requires agent token (or CORS origin from web)

## Tracking

- [ ] `/print/status?orderId=` polls and updates status
- [ ] Timeline advances through customer statuses
- [ ] Queue card shows position / placeholder ETA
- [ ] Pickup QR + code appear when ready
- [ ] Polling pauses when tab hidden; resumes on focus
- [ ] Terminal states stop polling
- [ ] Order history lists remembered orders on device

## Pickup

- [ ] `/admin/pickup/[token]` shows order ready to collect
- [ ] Collect marks COLLECTED; second collect → already collected
- [ ] Expired pickup (>24h after completed) blocked server-side
- [ ] Customer tracking shows EXPIRED_PICKUP flag after window

## Responsive

- [ ] Customer flow usable at 375px width
- [ ] Admin tables usable / scroll on tablet
- [ ] Sticky CTAs / totals do not obscure content

## Dark Mode

- [ ] Theme toggle persists across reload
- [ ] Contrast acceptable on upload, preview, payment, admin, pickup

## Production guards (staging with NODE_ENV=production)

- [ ] API refuses to start with `PAYMENT_PROVIDER=mock`
- [ ] API refuses weak / short `PRINT_AGENT_TOKEN`
- [ ] API refuses localhost `CORS_ORIGIN`
- [ ] Health endpoints respond
- [ ] No TypeScript / lint / build errors (`npm run typecheck && npm run lint && npm run build`)

## Security smoke

- [ ] Rate limit returns 429 after burst on `/api/uploads`
- [ ] Content URL without Origin/token → 401
- [ ] Agent routes without token → 401
- [ ] 500 responses do not leak stack traces in production
