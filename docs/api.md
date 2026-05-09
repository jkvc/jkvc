# API Conventions

## Charge-gated routes

Model-calling API routes are wrapped with `withCharge(poolId, handler)` from `app/lib/server/with-charge.ts`. The wrapper checks charges before the handler runs.

### Error responses

| Status | `error` field | Meaning |
|--------|--------------|---------|
| 429 | `out_of_charge` | Pool depleted. Body includes `retryAfterMs` and `poolId`. `Retry-After` header set in seconds. |
| 503 | `service_unavailable` | Redis unreachable (fail-closed). |

### Pre-flight check

`GET /api/usage/check?pools=id1,id2,id3` — returns `{ ok, pools: [{ id, available }] }`. Use before firing multiple concurrent model calls to avoid partial failures.

## Admin routes

All routes under `/api/admin/` are double-protected:

1. `proxy.ts` checks for the `admin_token` cookie — redirects to `/admin/login` if missing
2. Each route handler independently verifies the cookie token against Redis via `isAdminAuthenticated()`

### `POST /api/admin/usage/topoff`

Body: `{ poolId: string }`. Resets the specified pool to max charges.

### `POST /api/admin/auth`

Body: `{ token: string }`. Verifies against Redis `admin:token` key, sets `HttpOnly` cookie on success.

### `DELETE /api/admin/auth`

Clears the admin cookie (logout).

## Authentication

Redis-backed token auth. A secret token is stored at Redis key `admin:token`. The admin login page accepts the token, which is verified against Redis and stored as an `HttpOnly` cookie. No third-party auth provider needed.
