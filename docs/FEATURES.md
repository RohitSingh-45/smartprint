# SmartPrint Features

## Product vision

Users upload documents, choose Color or Black & White per page, pay online, and send print jobs to printers identified via QR codes.

## Sprint 1 (delivered)

| Feature                                                   | Status |
| --------------------------------------------------------- | ------ |
| Monorepo scaffolding                                      | Done   |
| Next.js frontend shell                                    | Done   |
| Express API shell                                         | Done   |
| MongoDB connection                                        | Done   |
| Readiness + liveness health endpoints                     | Done   |
| API foundation hardening (env, Helmet, logging, shutdown) | Done   |
| ESLint / Prettier                                         | Done   |
| Env templates & docs                                      | Done   |

## Sprint 2 (delivered — UI foundation)

| Feature                          | Status |
| -------------------------------- | ------ |
| Full print journey screens       | Done   |
| Clickable navigation + mock data | Done   |
| Dark mode support                | Done   |
| Admin sidebar/topbar shell       | Done   |

## Sprint 3 (delivered — upload engine)

| Feature                                      | Status |
| -------------------------------------------- | ------ |
| Secure upload API + local temp storage       | Done   |
| Drag/drop + click upload UI with progress    | Done   |
| Remove / replace uploaded file               | Done   |
| Swappable storage interface (local only now) | Done   |

## Sprint 4 (delivered — PDF preview)

| Feature                             | Status |
| ----------------------------------- | ------ |
| PDF.js multi-page preview           | Done   |
| Zoom / fit-width / lazy page render | Done   |
| Validated PDF content endpoint      | Done   |
| Auto-open preview after PDF upload  | Done   |

## Sprint 5 (delivered — print configuration)

| Feature                                      | Status |
| -------------------------------------------- | ------ |
| Page-wise Color / B&W selection              | Done   |
| Copies, range, paper, orientation            | Done   |
| Live summary + estimated cost + warnings     | Done   |
| Session config ready for payment integration | Done   |

## Sprint 6 (delivered — order drafts)

| Feature                              | Status |
| ------------------------------------ | ------ |
| Draft CRUD API with expiration       | Done   |
| Auto-sync from print configuration   | Done   |
| Countdown + refresh restore          | Done   |
| Ready for payment handoff (draft id) | Done   |

## Sprint 7 (delivered — payments)

| Feature                                         | Status |
| ----------------------------------------------- | ------ |
| Razorpay checkout from draft id                 | Done   |
| Mock provider for local testing                 | Done   |
| HMAC signature verification on backend          | Done   |
| Draft → Paid Order (`status: PAID`)             | Done   |
| Payment / processing / success / failed screens | Done   |
| Order confirmation with print + payment summary | Done   |
| Reject expired / invalid / duplicate payments   | Done   |

## Sprint 8 (delivered — shop owner dashboard)

| Feature                                              | Status |
| ---------------------------------------------------- | ------ |
| Dashboard home with revenue & order summary cards    | Done   |
| Orders list with search, filters, date range         | Done   |
| Order detail (file, print, payment, timeline)        | Done   |
| Accept / reject / enqueue / cancel with transition rules | Done |
| Printer status placeholder (UI-only)                 | Done   |
| Dark mode + responsive shop shell                    | Done   |

## Sprint 9 (delivered — queue management)

| Feature                                           | Status |
| ------------------------------------------------- | ------ |
| FIFO print queue with positions                    | Done   |
| Hold / resume / move up / move down               | Done   |
| QUEUED → READY_FOR_PRINT                          | Done   |
| Queue summary + search/filters                    | Done   |
| Duplicate / invalid transition guards             | Done   |
| `listReadyForPrintJobs()` for Sprint 10 intake    | Done   |

## Sprint 10 (delivered — Local Print Agent)

| Feature                                              | Status |
| ---------------------------------------------------- | ------ |
| Local Print Agent with shared-secret token           | Done   |
| Printer register + heartbeat + status model          | Done   |
| Claim READY_FOR_PRINT → PRINTING → COMPLETED/FAILED  | Done   |
| Retry / reprint / cancel printing                    | Done   |
| Admin Printers dashboard                             | Done   |
| Mock + CUPS (`lp`) spooler modes                     | Done   |

## Planned

| Feature                         | Sprint |
| ------------------------------- | ------ |
| Student live print status       | 11     |
| QR station pairing              | 11     |
| Authentication                  | 11     |

## Explicitly out of scope for Sprint 10

- Browser-to-printer communication
- Notifications
- Authentication / multi-shop
- New payment features
- Analytics beyond printer dashboard cards
