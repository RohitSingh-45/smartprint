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

## Planned

| Feature               | Sprint |
| --------------------- | ------ |
| Print queue + dispatch| 8      |
| Printer connectivity  | 8      |
| QR-based job dispatch | 8      |
| Authentication        | 9      |

## Explicitly out of scope for Sprint 7

- Printer integration / job dispatch
- Shop dashboard / admin features
- Queue system / notifications
- Authentication (unless required by existing architecture)
- Refunds / webhooks / settlement reports
