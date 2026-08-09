# EduZenix

A comprehensive SaaS ERP platform tailored for universities, colleges, and educational institutions to streamline operations and enhance efficiency.

This repository is the backend API: a multi-tenant Express 5 service written in TypeScript, backed by PostgreSQL through Prisma 7 (driver-adapter mode).

---

## Tech stack

| Concern        | Choice                                                              |
| -------------- | ------------------------------------------------------------------- |
| Runtime        | Node.js (>= 20 — the seed bundle targets `node20`), CommonJS output |
| Language       | TypeScript 5.9 (`strict`)                                           |
| HTTP framework | Express 5                                                           |
| Database       | PostgreSQL                                                          |
| ORM            | Prisma 7 + `@prisma/adapter-pg` (no query engine binary)            |
| Auth           | JWT access/refresh tokens in HTTP-only cookies, bcrypt hashing      |
| Logging        | pino                                                                |
| Hardening      | helmet, cors allowlist, express-rate-limit                          |
| Tooling        | ESLint 10 (flat config) + Prettier, ts-node/nodemon, esbuild        |

---

## Project structure

```
EduZenix-Backend/
├── prisma/
│   ├── migrations/                # SQL migration history (auth, crm)
│   └── schema/                    # Split schema — every .prisma file is merged
│       ├── schema.prisma          # generator + datasource only
│       ├── enums.prisma           # enums shared across domains
│       ├── auth.prisma            # Tenants, Packages, Roles, Users
│       └── crm.prisma             # CrmUniversity, CrmCollege, CrmSchool, CrmOtherInstitution
├── prisma.config.ts               # Prisma CLI config (loads .env.<NODE_ENV>)
├── src/
│   ├── app.ts                     # Express app: middleware chain + error handler
│   ├── bin/www.ts                 # Entry point: cluster, HTTP server, graceful shutdown
│   ├── config/
│   │   ├── cors.ts                # Origin allowlist from ALLOWED_ORIGINS
│   │   ├── db.ts                  # Prisma client singleton, connectDB/disconnectDB
│   │   └── index.ts
│   ├── helper/
│   │   ├── error-handler.ts       # ErrorHandler — Error + statusCode + type
│   │   └── index.ts
│   ├── middleware/
│   │   ├── auth.ts                # validateToken (global), authValidator (per-route)
│   │   ├── dispatcher.ts          # Controller wrapper: permission → run → respond
│   │   ├── handle-error.ts        # Terminal error responder
│   │   └── index.ts
│   ├── types/
│   │   ├── express/index.d.ts     # Augments Express.Request with `user`
│   │   └── logger/index.d.ts
│   ├── utils/
│   │   ├── constant.ts            # SUCCESS/FAILURE, pagination defaults, log severities
│   │   ├── crypto.ts              # AES-256-GCM encrypt/decrypt
│   │   ├── hash.ts                # bcrypt hashPassword/compare
│   │   ├── helper.ts              # camelize, throwError, extractErrorDetails
│   │   ├── jwt.ts                 # sign/verify/rotate access & refresh tokens
│   │   ├── logger.ts              # pino singleton (silent in production)
│   │   └── status-codes.ts        # Named HTTP status constants
│   └── generated/prisma/          # Generated Prisma client (git-ignored)
├── tsconfig.json                  # Type-check config (includes tests)
├── tsconfig.build.json            # Emit config → dist/
├── eslint.config.mts              # ESLint flat config
└── .env.example
```

---

## Getting started

### 1. Prerequisites

- Node.js 20+
- A reachable PostgreSQL instance (the schema uses `uuidv7()` for primary keys, so PostgreSQL 18+ or an extension providing `uuidv7()` is required)

### 2. Environment

Environment files are per-`NODE_ENV`. Copy the template and fill it in:

```bash
cp .env.example .env.development
```

`src/bin/www.ts` loads `.env.${NODE_ENV}`; the Prisma CLI (via `prisma.config.ts`) loads `.env.<NODE_ENV>.local`, then `.env.<NODE_ENV>`, then `.env` — first file to define a variable wins.

| Variable                   | Required | Purpose                                                           |
| -------------------------- | -------- | ----------------------------------------------------------------- |
| `DATABASE_URL`             | yes      | PostgreSQL connection string used by the pg driver adapter        |
| `PORT`                     | no       | HTTP port (defaults to `5000`)                                    |
| `ALLOWED_ORIGINS`          | yes      | Comma-separated CORS allowlist; requests with no origin pass      |
| `FRONTEND_URL`             | no       | Base URL used when building links back to the web app             |
| `JWT_ACCESS_SECRET`        | yes      | Signs 10-minute access tokens                                     |
| `JWT_REFRESH_SECRET`       | yes      | Signs 3-day refresh tokens                                        |
| `CRYPTO_ENCRYPTION_SECRET` | yes      | Key material for the AES-256-GCM helpers in `src/utils/crypto.ts` |
| `LOG_LEVEL`                | no       | pino level in non-production (defaults to `info`)                 |

### 3. Install, migrate, generate

```bash
npm run get:ready    # install deps + prisma migrate dev + prisma generate
```

Or step by step:

```bash
npm run get:deps
npm run prisma:migrate
npm run prisma:generate
```

### 4. Run

```bash
npm run dev          # nodemon + ts-node, watches src/**/*.ts
```

---

## npm scripts

| Script                          | What it does                                                          |
| ------------------------------- | --------------------------------------------------------------------- |
| `dev`                           | Development server with reload (`NODE_ENV=development`)               |
| `build`                         | `tsc -p tsconfig.build.json` → `dist/`, then bundles the seed         |
| `start`                         | Runs the compiled server (`NODE_ENV=production node dist/bin/www.js`) |
| `typecheck`                     | `tsc --noEmit` across `src`, `test`, and `prisma.config.ts`           |
| `lint`                          | ESLint over the repo                                                  |
| `test` / `:watch` / `:coverage` | Jest (see note below)                                                 |
| `prisma:migrate`                | `prisma migrate dev` against the development env                      |
| `prisma:generate`               | Regenerates the client into `src/generated/prisma`                    |
| `setup`                         | `prisma migrate deploy` — production migration apply                  |
| `seed:dev` / `seed:prod`        | Runs the seed script (TS in dev, bundled JS in prod)                  |
| `docker-start`                  | `setup` → `seed:prod` → `start`                                       |

---

## Architecture notes

### Process model

`src/bin/www.ts` uses Node's `cluster` module: the primary forks one worker per CPU in production (a single worker in development). Each worker opens the Prisma pool once at boot via `connectDB()` and calls `disconnectDB()` on `SIGINT`/`SIGTERM` before exiting.

### Request pipeline

```
helmet → cors(corsOptions) → body-parser (urlencoded + json, 100 MB) → cookie-parser
       → express.static → rateLimit (100 req / 15 min per IP) → validateToken → routes → handleError
```

`validateToken` runs globally and is non-blocking: it always attaches `req.user` (with `isAuth: false` and the client IP), and upgrades it to an authenticated user when a valid `access_token` cookie is present. Routes that require a session opt in with `authValidator`.

### Controllers and the dispatcher

Controllers do not touch `res` directly — they return a plain object and `dispatcher` handles the response envelope:

```ts
router.get("/users", (req, res, next) => dispatcher(req, res, next, listUsers, "users", "read"));
```

`dispatcher` runs an optional permission check, invokes the controller, and then either streams an export (when `req.body.export` is set) or replies:

```json
{ "status": "success", "data": {/* camelCased */} }
```

Errors thrown anywhere in the chain reach `handleError`, which emits:

```json
{ "status": "failure", "statusCode": 401, "message": "...", "type": "tokenExpiredError" }
```

Throw `new ErrorHandler(statusCode, message, type)` for expected failures; `throwError(err)` in `src/utils/helper.ts` normalizes unknown errors into the same shape and logs anything unrecognized as a 500.

### Authentication

- Access token: 10 minutes, signed with `JWT_ACCESS_SECRET`, read from the `access_token` cookie.
- Refresh token: 3 days, signed with `JWT_REFRESH_SECRET`, verified with `ignoreExpiration: true`.
- `rotateRefreshToken` reissues a refresh token only when fewer than 24 hours remain.
- Passwords are bcrypt-hashed at 10 rounds (`src/utils/hash.ts`).

### Data model

The schema is split by domain under `prisma/schema/`; the Prisma CLI merges every `.prisma` file in that folder, so adding a domain means dropping in a new file — no registration step.

- **auth** — `Tenants` (the multi-tenancy root, typed `UNIVERSITY | COLLEGE | SCHOOL | OTHER_INSTITUTION`), `Packages` (subscription plan with start/expiry), `Roles` (`SYSTEM` or `GENERAL`, scoped to a tenant), `Users` (tenant- and role-scoped, with MFA fields and a stored refresh token).
- **crm** — the pre-onboarding sales pipeline: `CrmUniversity`, `CrmCollege`, `CrmSchool`, `CrmOtherInstitution`. Each record carries AISHE/UDISE codes, location and management classification, a POC, an assigned owner, and a `CrmStatus` moving from `PENDING` through `UNDER_NEGOTIATION` / `REQUESTED_TO_ADMIN` to `APPROVED` or `REJECTED`. Once approved and onboarded, the record links to the `Tenants` row it became.

Primary keys are database-generated UUIDv7, and audit columns (`createdBy`, `updatedBy`, `createdAt`, `updatedAt`) are carried on the auth models.

---

## Conventions

- Barrel files (`index.ts`) re-export each folder's public surface — import from `../config`, `../middleware`, `../helper`, not from individual files.
- Use the named constants in `src/utils/status-codes.ts` instead of numeric literals.
- Responses are camelCased on the way out by `camelize`; write queries in whatever case the database uses.
- The logger is silent in production by design (`src/utils/logger.ts`); sensitive paths (`authorization`, `cookie`, `password`, `token`, `secret`) are redacted.
- Run `npm run lint` and `npm run typecheck` before pushing.

---

## License

ISC © Anand Kumar Karn
