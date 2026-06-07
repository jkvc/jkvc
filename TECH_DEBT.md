# Tech Debt

Consciously taken shortcuts and known issues. **All tech debt taken on must be recorded here.** Each entry must include what was skipped, why, and what to do about it. **Delete entries once resolved** — this file should shrink over time. Do not number entries; order doesn't matter and indices go stale.

---

## Charge system Lua script not tested against real Redis

**Added:** 2026-05-08
**Files:** `next-charge` package (engine.ts), `app/__tests__/charge-engine.test.ts`

**What:** The Lua script inside `consumeCharge` is tested via a mock that simulates `redis.eval()` returning pre-determined JSON. The recharge math is tested exhaustively via the pure `computeRecharge` function, but the Lua script itself is a transliteration that could diverge.

**Why:** Unit tests run without Redis. Integration tests against a real Redis instance would require CI infrastructure or a local Redis dependency.

**Fix:** Add an integration test in the `next-charge` package that runs the Lua script against a real Redis instance (e.g. via `testcontainers` or a conditional test that requires `REDIS_URL`). Verify the Lua script produces identical results to `computeRecharge` for a matrix of inputs.

---

## No pre-flight charge check in Image Reconstructor

**Added:** 2026-05-08
**Files:** `app/projects/image-reconstructor/ImageReconstructorClient.tsx`

**What:** Image Reconstructor fires sketch + generate-prompt + animate sequentially. If a middle pool is depleted, the user gets a partial result (e.g. sketch succeeds but animate fails). The `GET /api/usage/check` endpoint exists for pre-flight checking but isn't wired in yet.

**Why:** The sequential pipeline makes pre-flight slightly awkward — animate depends on the prompt result. Adding a pre-flight check before the first call would catch the common case but not the edge case where charges are consumed between check and use.

**Fix:** Call `GET /api/usage/check?pools=image-reconstructor-sketch,image-reconstructor-generate-prompt,image-reconstructor-animate` before starting the pipeline. Show "insufficient charges" upfront. Accept the TOCTOU race as unlikely.

---

## No pre-flight charge check in Image Labelifier

**Added:** 2026-05-08
**Files:** `app/projects/image-labelifier/ImageLabelifierClient.tsx`

**What:** Image Labelifier fires depth + segmentation concurrently. If one pool is depleted, the user gets a partial result.

**Why:** Same reasoning as Image Reconstructor — pre-flight endpoint exists but isn't wired in.

**Fix:** Call `GET /api/usage/check?pools=image-labelifier-segmentation,image-labelifier-depth` before starting. Show "insufficient charges" if either is unavailable.

---

## Admin page "top off all" does full page reload

**Added:** 2026-05-08
**Files:** `app/admin/usage/page.tsx`

**What:** The "top off all" button fires N sequential top-off API calls then reloads the page via `window.location.reload()` instead of updating state in place.

**Why:** Quick implementation. The ChargeStatusPanel already polls every 30s, but waiting 30s after top-off feels slow.

**Fix:** Have the top-off-all handler call `fetchPools()` after all top-off requests complete. Requires either lifting `fetchPools` to a shared ref/callback or using a state management approach (e.g. SWR mutate).

