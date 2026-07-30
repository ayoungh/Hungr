# Hungr

Hungr is a private food-sharing app built as a pnpm workspace:

- `apps/api` — NestJS 11, MongoDB/Mongoose, cookie JWT authentication, and OpenAPI.
- `apps/web` — Next.js 16 and an Orval-generated Axios client.

The browser talks to same-origin `/api/*` routes. Next.js proxies those requests
to NestJS, so the seven-day authentication JWT stays in an HttpOnly cookie and
is never exposed to client JavaScript.

## Requirements

- Node.js 24 LTS
- pnpm 10
- MongoDB

```bash
nvm use
pnpm install
cp .env.example .env.local
```

Replace `JWT_SECRET` with at least 32 random characters before using a shared
environment. `MONGODB_URI` and `JWT_SECRET` are mandatory in production.

## Development

Start the Nest API on port 4000 and the Next.js app on port 3000:

```bash
pnpm dev
```

Open:

- App: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs.json`
- Health: `http://localhost:3000/healthz`

`API_ORIGIN` is server-only. In local development it defaults to
`http://127.0.0.1:4000`; set it to the internal NestJS origin when deploying the
web and API as separate processes.

## API

All product routes are versioned under `/api/v1`:

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- `GET /auth/session`
- `GET /users/me`, `PATCH /users/me`
- `GET /foods`, `POST /foods`
- `GET /foods/:id`, `PATCH /foods/:id`, `DELETE /foods/:id`

Food queries are always scoped to the authenticated owner. A request for
another user's food returns 404.

OpenAPI is generated from Nest decorators without starting MongoDB. Orval then
generates the typed browser client:

```bash
pnpm api:generate
pnpm api:check
```

`api:check` fails when the committed OpenAPI document or generated client is
stale.

## Legacy food ownership

Foods created by the old Express server have no owner and are intentionally
hidden from normal API responses. Inspect them without changing data:

```bash
pnpm migrate:food-owners
```

To preview an intended owner:

```bash
pnpm migrate:food-owners -- --owner-email you@example.com
```

Apply the assignment explicitly:

```bash
pnpm migrate:food-owners -- --owner-email you@example.com --apply
```

The command only assigns foods whose `owner` is missing, so repeated runs are
safe and do not delete or reassign records.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:browser
```

The API suite uses an isolated in-memory MongoDB. The browser smoke test starts
an isolated API and verifies signup, session restoration, food creation, and
logout through the real Next.js proxy.

## Production shape

Build both applications with `pnpm build`. Run NestJS with
`pnpm --filter @hungr/api start:prod` and Next.js with
`pnpm --filter @hungr/web start`. Configure the web process's `API_ORIGIN` to
reach the API process and set `APP_ORIGIN` to the public web origin.
