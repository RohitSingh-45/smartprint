# SmartPrint

QR-based smart printing for students and campus print shops.

**Version:** 1.0.0  
**Core workflow:** QR Scan → Upload → Preview → Configure → Pay → Queue → Print → Pickup

## Monorepo

| Package | Path | Role |
|---------|------|------|
| `@smartprint/web` | `apps/web` | Next.js 15 customer + shop UI |
| `@smartprint/api` | `apps/api` | Express + TypeScript API |
| `@smartprint/print-agent` | `apps/print-agent` | Local print agent (poll + spool) |

## Requirements

- Node.js **20+** (see `.nvmrc`)
- MongoDB (API readiness / health; business data uses local JSON stores in v1)
- Optional: Razorpay keys for real payments; CUPS/`lp` for real printing

## Quick start

```bash
npm install

# Terminal 1 — API
cp apps/api/.env.example apps/api/.env
npm run dev:api

# Terminal 2 — Web
cp apps/web/.env.example apps/web/.env.local
npm run dev:web

# Terminal 3 — Print agent (optional)
cp apps/print-agent/.env.example apps/print-agent/.env
npm run dev:agent
```

- Web: http://localhost:3000  
- API health: http://localhost:4000/api/health  

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:web` / `dev:api` / `dev:agent` | Dev servers |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run typecheck` | Typecheck all workspaces |
| `npm run format` | Prettier write |

## Production checklist (summary)

1. `NODE_ENV=production`
2. `PAYMENT_PROVIDER=razorpay` + real `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
3. Strong unique `PRINT_AGENT_TOKEN` (≥24 chars) on API **and** agent
4. Public `CORS_ORIGIN` matching the web app
5. `npm ci && npm run typecheck && npm run lint && npm run build`
6. Run full `docs/QA_CHECKLIST.md`
7. Tag `v1.0.0` per `docs/RELEASE_NOTES.md`

Mock payment and default agent tokens are **rejected** when `NODE_ENV=production`.

## Documentation

| Doc | Purpose |
|-----|---------|
| `docs/RELEASE_NOTES.md` | v1.0 release notes |
| `docs/QA_CHECKLIST.md` | Manual QA |
| `docs/KNOWN_LIMITATIONS.md` | v1 constraints |
| `docs/ROADMAP.md` | Version 2 only |
| `docs/CHANGELOG.md` | Version history |
| `docs/TECHNICAL_DEBT.md` | Deferred work |
| `docs/ARCHITECTURE.md` | System overview |

## License

Private — all rights reserved.
