# SmartPrint

QR-based smart printing platform. Users upload PDF/DOCX/image files, choose Color or Black & White per page, pay online, and send jobs to connected printers.

> **Sprint 1 status:** Project initialized only. No auth, upload, payment, or printer features yet.

## Monorepo structure

```text
smartprint/
├── apps/
│   ├── web/                 # Next.js (App Router) + TypeScript + Tailwind
│   └── api/                 # Node.js + Express + TypeScript
├── packages/                # Shared packages (future)
├── docs/                    # Product & engineering docs
├── .env.example             # Environment variable reference
├── .prettierrc              # Prettier config
├── package.json             # npm workspaces root
└── README.md
```

### Frontend (`apps/web`)

```text
src/
├── app/           # App Router pages & layouts
├── components/    # Reusable UI components
├── hooks/         # React hooks
├── lib/           # Utilities & helpers
├── services/      # API client / external services
└── types/         # Shared frontend types
```

### Backend (`apps/api`)

```text
src/
├── config/        # Env + MongoDB connection
├── controllers/   # Route handlers (future)
├── middleware/    # Express middleware
├── models/        # Mongoose models (future)
├── routes/        # API routes
├── services/      # Business logic (future)
├── types/         # Shared backend types
├── utils/         # Helpers
└── index.ts       # App entry
```

## Prerequisites

- Node.js **20+** (see `.nvmrc`)
- npm **10+**
- MongoDB **7+** running locally (or a MongoDB Atlas URI)

## Setup

```bash
# 1. Clone and install
git clone <repo-url> smartprint
cd smartprint
npm install

# 2. Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Start MongoDB (example with Docker)
docker run -d --name smartprint-mongo -p 27017:27017 mongo:7

# 4. Run apps (separate terminals)
npm run dev:api
npm run dev:web
```

| App           | URL                                   |
| ------------- | ------------------------------------- |
| Web           | http://localhost:3000                 |
| Print flow    | http://localhost:3000/print/qr        |
| Admin shell   | http://localhost:3000/admin           |
| API readiness | http://localhost:4000/api/health      |
| API liveness  | http://localhost:4000/api/health/live |

## Scripts

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `npm install`          | Install all workspace dependencies |
| `npm run dev:web`      | Start Next.js dev server           |
| `npm run dev:api`      | Start Express API (tsx watch)      |
| `npm run build`        | Build all workspaces               |
| `npm run lint`         | Lint all workspaces                |
| `npm run format`       | Format with Prettier               |
| `npm run format:check` | Check Prettier formatting          |

## Environment variables

See `.env.example` and per-app `.env.example` files.

| Variable               | App | Description                                   |
| ---------------------- | --- | --------------------------------------------- |
| `NEXT_PUBLIC_API_URL`  | web | Backend base URL                              |
| `NEXT_PUBLIC_APP_NAME` | web | Display name                                  |
| `PORT`                 | api | API port (default `4000`)                     |
| `MONGODB_URI`          | api | MongoDB connection string                     |
| `CORS_ORIGIN`          | api | Allowed frontend origin (must be a valid URL) |
| `NODE_ENV`             | api | `development` / `production` / `test`         |
| `JSON_BODY_LIMIT`      | api | Express JSON body limit (default `100kb`)     |
| `UPLOAD_DIR`           | api | Temp upload directory (default `uploads`)     |
| `UPLOAD_MAX_BYTES`     | api | Max upload size in bytes (default 25 MB)      |
| `STORAGE_DRIVER`       | api | Storage backend (`local` only for now)        |

## Documentation

- [Roadmap](docs/ROADMAP.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Features](docs/FEATURES.md)
- [Changelog](docs/CHANGELOG.md)

## Possible setup errors

| Error                            | Cause                        | Fix                                                                                      |
| -------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
| `ECONNREFUSED 127.0.0.1:27017`   | MongoDB not running          | Start MongoDB or update `MONGODB_URI` (dev still boots; `/api/health` → 503; prod exits) |
| Invalid environment variables    | Bad/missing env values       | Fix `apps/api/.env` using `.env.example`                                                 |
| `Port 3000 already in use`       | Another Next.js process      | Stop it or use `next dev -p 3001`                                                        |
| `Port 4000 already in use`       | Another API process          | Change `PORT` in `apps/api/.env`                                                         |
| `Cannot find module` after clone | Dependencies not installed   | Run `npm install` from repo root                                                         |
| Workspace package not found      | Install from a nested folder | Always install from the monorepo root                                                    |
| ESLint / Prettier conflicts      | Mixed configs                | Use root Prettier; app ESLint extends `prettier`                                         |

## License

Private — all rights reserved.
