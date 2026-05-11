# Charge System

Token-bucket rate limiter for model-calling API routes. Prevents unbounded spend from public-facing demos.

## How it works

Each metered endpoint has a **charge pool** with two parameters:

- **maxCharges (X)** — maximum accumulated charges
- **rechargeIntervalHours (Y)** — hours to regenerate 1 charge

Charges accumulate passively. A pool starts full and regenerates up to `maxCharges`. Each API call consumes 1 charge atomically via a Redis Lua script.

## Configuration

The charge system is powered by the `next-charge` npm package. Pool definitions live in `app/lib/server/charge.ts`. To add a new metered endpoint: add an entry to the `pools` array with an `id`, `group`, `label`, `maxCharges`, and `rechargeIntervalHours`, then wrap the route handler with `withCharge(poolId, handler)`.

## Redis key schema

Each pool stores state at `charge:{poolId}` as JSON: `{ current: number, lastUpdatedAt: number }`. Missing keys initialize as fully charged.

## Recharge math

On every consume or read, the engine computes earned recharges: `floor(elapsed / intervalMs)`. The `lastUpdatedAt` advances by exact recharge intervals (not to "now") to preserve partial progress toward the next recharge.

## Fail-closed

If Redis is unreachable in production, model API calls return 503 rather than proceeding unmetered. This prioritizes cost control over availability.

## Dev bypass

In `NODE_ENV=development`, `consumeCharge` always succeeds without touching Redis. Dashboard reads (`getChargeState`/`getAllChargeStates`) fall back to synthetic "fully charged" data if Redis is unavailable.

## Pages

- `/usage` (public) — read-only dashboard showing all charge levels and recharge timers
- `/admin/usage` (auth-protected) — same dashboard with top-off buttons

## Frontend integration

Demo client components use `useChargeFetch()` instead of raw `fetch()`. On 429 / `out_of_charge` responses, a sonner toast appears linking to `/usage`.
