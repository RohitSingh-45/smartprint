# Technical Debt

Captured during Sprints 3–5. Do not implement these here unless a future sprint explicitly schedules them.

## Upload / storage

- [ ] Swap `STORAGE_DRIVER=local` for AWS S3 or Cloudinary via the `FileStorage` interface
- [ ] Virus / malware scanning before accepting files
- [ ] Stronger content sniffing (magic bytes) beyond MIME + extension checks (partially done for PDF `%PDF-` on preview)
- [ ] TTL cleanup job for orphaned temp uploads
- [ ] Stream uploads to disk instead of buffering entire files in memory (multer memoryStorage)
- [ ] Authenticated uploads (tie files to a user/session) once auth exists
- [ ] Rate-limit `/api/uploads` to reduce abuse
- [ ] Persist upload metadata in MongoDB instead of sidecar `.meta.json` files
- [ ] Range-request / streaming PDF content for very large files instead of buffering full file in API memory

## PDF preview

- [ ] Server-side page-count extraction cached on upload
- [ ] Thumbnail strip / jump-to-page navigation
- [ ] Text-layer selection for accessibility beyond canvas
- [ ] DOCX → PDF conversion for preview parity
- [ ] Image preview gallery for JPG/PNG uploads
- [ ] Password prompt flow for protected PDFs (currently blocked with error)
- [ ] Virtualize page list more aggressively (unmount offscreen canvases)

## Print configuration

- [ ] Configure color/B&W by tapping pages directly on the PDF preview canvases
- [ ] Duplex / single-sided toggle
- [ ] Staple / punch finishing options
- [ ] Shop-specific price tables (per station) instead of hardcoded demo rates
- [ ] Persist print config to API/job draft (currently sessionStorage only)
- [ ] Enable A3 / Letter / Legal when shop inventory supports them
- [ ] N-up (2-up / 4-up) layout options
- [ ] Remember last-used settings per student device

## Product flow (later sprints)

- [ ] Real payment capture using saved print config + upload id
- [ ] Printer dispatch using stored upload ids and page modes

## Platform

- [ ] CI pipeline (lint, typecheck, build, upload/preview/config smoke tests)
- [ ] Structured logging (Pino) with request IDs
- [ ] Production env fail-closed defaults (no localhost CORS/Mongo fallbacks)
