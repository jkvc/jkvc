import { getRedis } from "./redis";
import { CHARGE_POOLS, getPool } from "./charge-config";

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface StoredCharge {
  current: number;
  lastUpdatedAt: number;
}

export interface RechargeResult {
  current: number;
  lastUpdatedAt: number;
  retryAfterMs?: number;
}

export interface ChargeState {
  id: string;
  label: string;
  demo: string;
  current: number;
  max: number;
  rechargeIntervalHours: number;
  nextRechargeAt: number | null;
  fullAt: number | null;
}

export type ConsumeResult =
  | { ok: true }
  | { ok: false; retryAfterMs: number };

export interface CheckResult {
  ok: boolean;
  pools: { id: string; available: boolean }[];
}

// --------------------------------------------------------------------------
// Pure recharge math — shared between TypeScript reads and Lua writes
// --------------------------------------------------------------------------

export function computeRecharge(
  stored: StoredCharge | null,
  maxCharges: number,
  rechargeIntervalMs: number,
  now: number,
): RechargeResult {
  if (!stored) {
    return { current: maxCharges, lastUpdatedAt: now };
  }

  const elapsed = now - stored.lastUpdatedAt;
  const rechargesEarned = Math.floor(elapsed / rechargeIntervalMs);
  const effectiveCurrent = Math.min(
    stored.current + rechargesEarned,
    maxCharges,
  );

  if (effectiveCurrent >= maxCharges) {
    return { current: maxCharges, lastUpdatedAt: now };
  }

  const newLastUpdatedAt =
    rechargesEarned > 0
      ? stored.lastUpdatedAt + rechargesEarned * rechargeIntervalMs
      : stored.lastUpdatedAt;

  const retryAfterMs =
    effectiveCurrent < 1
      ? rechargeIntervalMs - (elapsed % rechargeIntervalMs)
      : undefined;

  return {
    current: effectiveCurrent,
    lastUpdatedAt: newLastUpdatedAt,
    retryAfterMs,
  };
}

// --------------------------------------------------------------------------
// Redis key helpers
// --------------------------------------------------------------------------

function chargeKey(poolId: string): string {
  return `charge:${poolId}`;
}

function hoursToMs(hours: number): number {
  return hours * 3_600_000;
}

// --------------------------------------------------------------------------
// Lua script for atomic consume
// --------------------------------------------------------------------------

const CONSUME_LUA = `
local key = KEYS[1]
local maxCharges = tonumber(ARGV[1])
local intervalMs = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local raw = redis.call("GET", key)
local current, lastUpdatedAt

if raw then
  local data = cjson.decode(raw)
  current = tonumber(data.current)
  lastUpdatedAt = tonumber(data.lastUpdatedAt)
else
  current = maxCharges
  lastUpdatedAt = now
end

local elapsed = now - lastUpdatedAt
local rechargesEarned = math.floor(elapsed / intervalMs)
local effectiveCurrent = math.min(current + rechargesEarned, maxCharges)

if effectiveCurrent < 1 then
  local retryAfterMs = intervalMs - (elapsed % intervalMs)
  return cjson.encode({ok = false, retryAfterMs = retryAfterMs})
end

local newCurrent = effectiveCurrent - 1
local newLastUpdatedAt
if effectiveCurrent >= maxCharges then
  newLastUpdatedAt = now
elseif rechargesEarned > 0 then
  newLastUpdatedAt = lastUpdatedAt + rechargesEarned * intervalMs
else
  newLastUpdatedAt = lastUpdatedAt
end

redis.call("SET", key, cjson.encode({current = newCurrent, lastUpdatedAt = newLastUpdatedAt}))
return cjson.encode({ok = true})
`;

// --------------------------------------------------------------------------
// Dev bypass check
// --------------------------------------------------------------------------

function isDevBypass(): boolean {
  return process.env.NODE_ENV === "development";
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

export async function getChargeState(poolId: string): Promise<ChargeState> {
  const pool = getPool(poolId);
  if (!pool) throw new Error(`Unknown charge pool: ${poolId}`);

  const intervalMs = hoursToMs(pool.rechargeIntervalHours);

  if (isDevBypass()) {
    try {
      return await _getChargeStateFromRedis(pool, intervalMs);
    } catch {
      return syntheticFullState(pool);
    }
  }

  return _getChargeStateFromRedis(pool, intervalMs);
}

async function _getChargeStateFromRedis(
  pool: (typeof CHARGE_POOLS)[number],
  intervalMs: number,
): Promise<ChargeState> {
  const redis = getRedis();
  const raw = await redis.get(chargeKey(pool.id));
  const now = Date.now();

  const stored: StoredCharge | null = raw ? JSON.parse(raw) : null;
  const recharged = computeRecharge(stored, pool.maxCharges, intervalMs, now);

  const isFull = recharged.current >= pool.maxCharges;
  const deficit = pool.maxCharges - recharged.current;

  return {
    id: pool.id,
    label: pool.label,
    demo: pool.demo,
    current: recharged.current,
    max: pool.maxCharges,
    rechargeIntervalHours: pool.rechargeIntervalHours,
    nextRechargeAt: isFull ? null : recharged.lastUpdatedAt + intervalMs,
    fullAt: isFull ? null : recharged.lastUpdatedAt + deficit * intervalMs,
  };
}

function syntheticFullState(
  pool: (typeof CHARGE_POOLS)[number],
): ChargeState {
  return {
    id: pool.id,
    label: pool.label,
    demo: pool.demo,
    current: pool.maxCharges,
    max: pool.maxCharges,
    rechargeIntervalHours: pool.rechargeIntervalHours,
    nextRechargeAt: null,
    fullAt: null,
  };
}

export async function getAllChargeStates(): Promise<ChargeState[]> {
  if (isDevBypass()) {
    try {
      return await Promise.all(
        CHARGE_POOLS.map((p) =>
          _getChargeStateFromRedis(p, hoursToMs(p.rechargeIntervalHours)),
        ),
      );
    } catch {
      return CHARGE_POOLS.map(syntheticFullState);
    }
  }

  return Promise.all(
    CHARGE_POOLS.map((p) =>
      _getChargeStateFromRedis(p, hoursToMs(p.rechargeIntervalHours)),
    ),
  );
}

export async function consumeCharge(poolId: string): Promise<ConsumeResult> {
  const pool = getPool(poolId);
  if (!pool) throw new Error(`Unknown charge pool: ${poolId}`);

  if (isDevBypass()) {
    return { ok: true };
  }

  const redis = getRedis();
  const intervalMs = hoursToMs(pool.rechargeIntervalHours);
  const now = Date.now();

  const raw = await redis.eval(
    CONSUME_LUA,
    1,
    chargeKey(pool.id),
    String(pool.maxCharges),
    String(intervalMs),
    String(now),
  );

  return JSON.parse(raw as string) as ConsumeResult;
}

export async function topOff(poolId: string): Promise<void> {
  const pool = getPool(poolId);
  if (!pool) throw new Error(`Unknown charge pool: ${poolId}`);

  const redis = getRedis();
  const data: StoredCharge = {
    current: pool.maxCharges,
    lastUpdatedAt: Date.now(),
  };
  await redis.set(chargeKey(pool.id), JSON.stringify(data));
}

export async function checkCharges(poolIds: string[]): Promise<CheckResult> {
  const states = await Promise.all(poolIds.map((id) => getChargeState(id)));
  const pools = states.map((s) => ({ id: s.id, available: s.current >= 1 }));
  return {
    ok: pools.every((p) => p.available),
    pools,
  };
}
