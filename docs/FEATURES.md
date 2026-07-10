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

## Planned

| Feature                            | Sprint |
| ---------------------------------- | ------ |
| Color / B&W page selection + price | 5      |
| Authentication                     | 5      |
| Online payments                    | 6      |
| Printer connectivity               | 7      |
| QR-based job dispatch              | 7      |

## Explicitly out of scope for Sprint 4

- Authentication
- Payments / printer integration
- Color / B&W page selection
- Pricing / queue / admin features
- DOCX/image preview (PDF only)
