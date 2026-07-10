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

## Sprint 3 (delivered — upload engine)

| Feature                                      | Status |
| -------------------------------------------- | ------ |
| Secure upload API + local temp storage       | Done   |
| Drag/drop + click upload UI with progress    | Done   |
| Remove / replace uploaded file               | Done   |
| Swappable storage interface (local only now) | Done   |

## Planned

| Feature                              | Sprint |
| ------------------------------------ | ------ |
| Authentication + protected uploads   | 4      |
| Real PDF preview + Color/B&W binding | 4      |
| Online payments                      | 5      |
| Printer connectivity                 | 6      |
| QR-based job dispatch                | 6      |

## Explicitly out of scope for Sprint 3

- Authentication
- Payments / printer integration
- PDF preview and page selection
- Cloud storage (S3/Cloudinary) — interface only
- MongoDB persistence for uploads
