# Expense Tracker

A small full-stack expense tracker. Record personal expenses, review them, filter and sort, and see the running total.

**Live demo:** _(added after Part B)_
**Stack:** Express + TypeScript · MongoDB Atlas · Vite + React + TypeScript · Tailwind CSS

---

## Screenshot
<img width="959" height="958" alt="Image" src="https://github.com/user-attachments/assets/d618965d-c738-4d11-bfef-5af7007178b5" />

## Running locally

**Prerequisites:** Node 18+, a MongoDB connection string (Atlas free tier or local).

```bash
git clone <repo-url>
cd expense-tracker
```

**Live demo:** https://fenmo-finance-tool-tau.vercel.app/
**API:** https://fenmo-finance-api.onrender.com/

> Note: backend is on Render's free tier and cold-starts after ~15 min of inactivity. First request after idle may take ~30s.

**Backend:**

```bash
cd backend
cp .env.example .env      # fill MONGO_URI and CORS_ORIGIN
npm install
npm run dev               # http://localhost:4000
```

**Frontend (separate terminal):**

```bash
cd frontend
cp .env.example .env      # defaults to http://localhost:4000
npm install
npm run dev               # http://localhost:5173
```

**Tests:**

```bash
cd backend
npm test
```

---

## Repo layout

```
.
├── backend/     Express API, MongoDB, Jest tests
└── frontend/    Vite + React SPA
```

Monorepo with two separate `package.json`s — simple, keeps each deployable as its own unit. No workspace tooling needed at this size.

---

## API

All responses are JSON. Amounts are **integer paise** at the API boundary (₹12.50 → `1250`).

### `POST /expenses`

Creates an expense. Requires an `Idempotency-Key` header.

```
POST /expenses
Content-Type: application/json
Idempotency-Key: <uuid>

{
  "amount": 1250,
  "category": "Food",
  "description": "Lunch",
  "date": "2026-04-20"
}
```

Retrying the same request with the same `Idempotency-Key` returns the original response without creating a duplicate. Keys expire after 24 hours.

### `GET /expenses`

Returns an array. Query params:

- `category` — case-insensitive exact match (optional)
- `sort` — `date_desc` (default) or `date_asc`

### `GET /health`

Returns `{ status, db }`. `503` if the DB isn't connected.

---

## Design decisions

### Money as integer paise

`₹12.50` is stored as `1250`. Floating-point arithmetic on money is a known source of silent correctness bugs (`0.1 + 0.2 !== 0.3`). Using integer paise end-to-end — API contract, database, in-memory — means every arithmetic operation, including the total, is on safe integers. Conversion to rupees happens only at the display boundary.

The schema enforces `Number.isInteger` at validation time so it's impossible to accidentally insert a float.

### Idempotent POST

The spec explicitly calls out retry-safety as a real-world requirement. The implementation:

1. Client generates a UUID per logical submit, sent as `Idempotency-Key` header.
2. Server looks up the key in a dedicated collection before processing.
3. On hit, returns the cached response untouched.
4. On miss, creates the expense, then stores `(key → response)` with a 24-hour TTL.
5. Concurrent requests with the same key are resolved by a unique index — the loser deletes its expense and returns the winner's cached response.

The idempotency store is a separate collection, not a field on the expense. This keeps business data clean and lets the cache TTL out without cascading deletes.

Frontend pairs this with bounded retry (3 attempts, 0s / 1s / 3s) for `createExpense`. 4xx errors don't retry (validation won't succeed by trying again); network failures and 5xx do. The same key travels across all retry attempts — that's the whole point.

### Mongoose + MongoDB

Chose Mongoose over the raw driver for schema validation and TTL index support without hand-rolling migrations. MongoDB Atlas free tier is enough for this dataset, and the driver plays nicely with Mongoose types. A relational DB would be a reasonable alternative — for a fixed schema like this there's no strong win either way.

### Filter/sort server-side, total client-side

Filter and sort go through the API — the backend already has the indexes, and doing it client-side would duplicate logic and drift as the list grows. Total is computed from whatever's visible in the UI, because "current list" by definition means "after filters."

### Category dropdown derived from data

No hardcoded category enum. The dropdown is populated from whatever categories the user has actually created. Adds flexibility at zero cost.

### Loading = skeleton, errors = banner with retry

Skeleton instead of spinner — matches the shape of what's coming, feels less jumpy on filter changes. Every error state has a "Try again" button; the app never dead-ends on a network blip.

### Validation

Zod on the backend for both request body and query params. The `validateBody` / `validateQuery` split exists because Express 5 made `req.query` getter-only — can't reassign it, so parsed query params live on a separate field. Client mirrors the same rules for fast feedback; backend is the source of truth.

### Response shape

API returns `id` (not `_id`) and no `__v`. A Mongoose `toJSON` transform handles this centrally so no route has to remember to do it.

---

## Trade-offs I made because of the timebox

- **No pagination.** Personal finance tool, list stays small. Would add `limit` + `cursor` the moment it stopped fitting on screen.
- **No auth or multi-user.** Single-user demo. Real deployment would need at minimum session auth and a `userId` on every expense + index + filter scope.
- **Category dropdown does one extra fetch** to get the unfiltered set. A dedicated `GET /categories` endpoint would be cleaner but adds backend surface area for marginal gain.
- **No update or delete endpoints.** Spec doesn't require them; adding a full CRUD scaffold would distract from the parts that matter.
- **Manual environment config.** Production would use a secret manager; for this exercise `.env` is enough.
- **CORS allows a single origin via env var.** Fine for a known frontend URL. If this served multiple frontends, I'd switch to an allowlist.
- **Mongo IP access set to `0.0.0.0/0`** for the demo. Real deployment would restrict to the backend host's IP range.
- **Tests cover the highest-leverage paths** (idempotency, filter, sort, response shape), not every validation branch. Zod is well-tested upstream; I tested that we wired it up, not that it works.

---

## What I intentionally did not do

- **No optimistic UI for create.** The response arrives fast enough (sub-200ms on local) that a spinner on the button feels more honest than flashing a row that might roll back. If the app grew to handle slow networks as the norm, I'd revisit.
- **No retry on `listExpenses`.** GETs that fail should surface clearly so the user can retry with intent. Silent background retries would mask real backend issues.
- **No `helmet`, rate limiting, or request IDs.** All reasonable hardening layers; out of scope for a timeboxed personal-use tool. Noted as the first things I'd add for production.
- **No E2E tests.** Supertest + real Mongo (via `mongodb-memory-server`) already tests the HTTP → DB path end-to-end. Browser E2E is too much setup-per-value at this size.
- **No shared types package between backend and frontend.** Duplicated the `Expense` shape (5 fields, boring) in `frontend/src/types.ts`. A monorepo `shared/` package would be overkill for one type; I'd revisit the moment a second type appeared.
- **No dark mode, no animations beyond basic transitions.** Spec says keep styling simple.

---

## AI assistance

Used Claude to pair-program through the assignment as a step-by-step review: scaffolding, design decisions (idempotency design, paise-integer rationale, Express 5 `req.query` gotcha), and TypeScript error resolution. Every design choice and trade-off above was my call; Claude accelerated the typing.

---

## What I'd add next, in order

1. Auth + per-user scoping
2. Edit and delete endpoints with optimistic UI
3. Pagination + virtualization on the list
4. Summary view (total per category) — the "Nice to Have" I skipped
5. Rate limiting and request IDs
6. Shared types package
