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

## Sprint 2 (delivered — UI only)

| Feature                          | Status |
| -------------------------------- | ------ |
| Full print journey screens       | Done   |
| Clickable navigation + mock data | Done   |
| Dark mode support                | Done   |
| Admin sidebar/topbar shell       | Done   |

## Planned

| Feature                               | Sprint |
| ------------------------------------- | ------ |
| Authentication                        | 3      |
| Real file upload (PDF / DOCX / image) | 3      |
| Persist Color / B&W selection         | 3      |
| Online payments                       | 4      |
| Printer connectivity                  | 5      |
| QR-based job dispatch                 | 5      |
| Job status tracking                   | 5      |

## Explicitly out of scope for Sprint 2

- Backend business logic
- Authentication
- Real file uploads / payments / printer integration
- Database models for jobs/orders
