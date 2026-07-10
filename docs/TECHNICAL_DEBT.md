# Technical Debt

Captured during Sprint 3 (File Upload Engine). Do not implement these here unless a future sprint explicitly schedules them.

## Upload / storage

- [ ] Swap `STORAGE_DRIVER=local` for AWS S3 or Cloudinary via the `FileStorage` interface
- [ ] Virus / malware scanning before accepting files
- [ ] Stronger content sniffing (magic bytes) beyond MIME + extension checks
- [ ] TTL cleanup job for orphaned temp uploads
- [ ] Stream uploads to disk instead of buffering entire files in memory (multer memoryStorage)
- [ ] Authenticated uploads (tie files to a user/session) once auth exists
- [ ] Rate-limit `/api/uploads` to reduce abuse
- [ ] Persist upload metadata in MongoDB instead of sidecar `.meta.json` files

## Product flow (later sprints)

- [ ] Real PDF/DOCX page preview from uploaded files
- [ ] Per-page Color / B&W selection bound to upload id
- [ ] Pricing engine using page counts from the uploaded document
- [ ] Payment + printer dispatch using stored upload ids

## Platform

- [ ] CI pipeline (lint, typecheck, build, upload smoke tests)
- [ ] Structured logging (Pino) with request IDs
- [ ] Production env fail-closed defaults (no localhost CORS/Mongo fallbacks)
