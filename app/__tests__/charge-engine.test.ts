import { describe, it, expect, beforeEach } from "vitest";
import {
  computeRecharge,
  createChargeSystem,
  type ChargeState,
  type ConsumeResult,
  type ChargeRedis,
  type ChargePoolConfig,
} from "next-charge";

// --------------------------------------------------------------------------
// Pure recharge math (no Redis)
// --------------------------------------------------------------------------

describe("computeRecharge", () => {
  const MAX = 10;
  const INTERVAL_MS = 3_600_000; // 1 hour

  it("returns full charges and no recharges when pool is new (no stored state)", () => {
    const now = Date.now();
    const result = computeRecharge(null, MAX, INTERVAL_MS, now);
    expect(result.current).toBe(MAX);
    expect(result.lastUpdatedAt).toBe(now);
  });

  it("earns zero recharges when no time has elapsed", () => {
    const now = Date.now();
    const result = computeRecharge(
      { current: 5, lastUpdatedAt: now },
      MAX,
      INTERVAL_MS,
      now,
    );
    expect(result.current).toBe(5);
    expect(result.lastUpdatedAt).toBe(now);
  });

  it("earns 1 recharge after exactly 1 interval", () => {
    const start = 1_000_000;
    const result = computeRecharge(
      { current: 5, lastUpdatedAt: start },
      MAX,
      INTERVAL_MS,
      start + INTERVAL_MS,
    );
    expect(result.current).toBe(6);
    expect(result.lastUpdatedAt).toBe(start + INTERVAL_MS);
  });

  it("earns multiple recharges for multiple intervals", () => {
    const start = 1_000_000;
    const result = computeRecharge(
      { current: 3, lastUpdatedAt: start },
      MAX,
      INTERVAL_MS,
      start + 3 * INTERVAL_MS,
    );
    expect(result.current).toBe(6);
    expect(result.lastUpdatedAt).toBe(start + 3 * INTERVAL_MS);
  });

  it("preserves partial recharge progress", () => {
    const start = 1_000_000;
    const elapsed = 1.5 * INTERVAL_MS;
    const result = computeRecharge(
      { current: 5, lastUpdatedAt: start },
      MAX,
      INTERVAL_MS,
      start + elapsed,
    );
    expect(result.current).toBe(6);
    expect(result.lastUpdatedAt).toBe(start + INTERVAL_MS);
  });

  it("caps charges at maxCharges", () => {
    const start = 1_000_000;
    const result = computeRecharge(
      { current: 9, lastUpdatedAt: start },
      MAX,
      INTERVAL_MS,
      start + 5 * INTERVAL_MS,
    );
    expect(result.current).toBe(MAX);
    expect(result.lastUpdatedAt).toBe(start + 5 * INTERVAL_MS);
  });

  it("does not exceed maxCharges even when already full", () => {
    const start = 1_000_000;
    const result = computeRecharge(
      { current: MAX, lastUpdatedAt: start },
      MAX,
      INTERVAL_MS,
      start + 10 * INTERVAL_MS,
    );
    expect(result.current).toBe(MAX);
  });

  it("handles zero current with recharge earning", () => {
    const start = 1_000_000;
    const result = computeRecharge(
      { current: 0, lastUpdatedAt: start },
      MAX,
      INTERVAL_MS,
      start + 2 * INTERVAL_MS,
    );
    expect(result.current).toBe(2);
    expect(result.lastUpdatedAt).toBe(start + 2 * INTERVAL_MS);
  });

  it("computes correct retryAfterMs when depleted with no recharges earned", () => {
    const start = 1_000_000;
    const partialElapsed = 0.3 * INTERVAL_MS;
    const result = computeRecharge(
      { current: 0, lastUpdatedAt: start },
      MAX,
      INTERVAL_MS,
      start + partialElapsed,
    );
    expect(result.current).toBe(0);
    expect(result.retryAfterMs).toBeCloseTo(0.7 * INTERVAL_MS, 0);
  });
});

// --------------------------------------------------------------------------
// Redis-backed operations (mocked)
// --------------------------------------------------------------------------

const TEST_POOLS: ChargePoolConfig[] = [
  { id: "photo-commentator-comment", maxCharges: 10, rechargeIntervalHours: 1, label: "Comment", group: "Photo Commentator" },
  { id: "photo-commentator-theme", maxCharges: 10, rechargeIntervalHours: 1, label: "Theme", group: "Photo Commentator" },
];

function createMockRedis() {
  const store: Record<string, string> = {};
  let luaHandler: ((...args: unknown[]) => unknown) | null = null;

  const redis: ChargeRedis = {
    get: async (key: string) => store[key] ?? null,
    set: async (key: string, value: string) => {
      store[key] = value;
      return "OK";
    },
    eval: async (script: string, keys: string[], args: string[]) => {
      if (luaHandler) return luaHandler(script, keys, args);
      return null;
    },
  };

  return {
    redis,
    store,
    setLuaHandler: (fn: ((...args: unknown[]) => unknown) | null) => {
      luaHandler = fn;
    },
  };
}

describe("charge-engine Redis operations", () => {
  let mock: ReturnType<typeof createMockRedis>;

  beforeEach(() => {
    mock = createMockRedis();
  });

  describe("getChargeState", () => {
    it("returns fully charged state for a new pool", async () => {
      const { getChargeState } = createChargeSystem({ redis: mock.redis, pools: TEST_POOLS });
      const state = await getChargeState("photo-commentator-comment");
      expect(state.current).toBe(10);
      expect(state.max).toBe(10);
      expect(state.rechargeIntervalHours).toBe(1);
      expect(state.nextRechargeAt).toBeNull();
      expect(state.fullAt).toBeNull();
    });

    it("computes nextRechargeAt when not full", async () => {
      const now = Date.now();
      mock.store["charge:photo-commentator-comment"] = JSON.stringify({
        current: 5,
        lastUpdatedAt: now,
      });
      const { getChargeState } = createChargeSystem({ redis: mock.redis, pools: TEST_POOLS });
      const state = await getChargeState("photo-commentator-comment");
      expect(state.current).toBe(5);
      expect(state.nextRechargeAt).toBe(now + 3_600_000);
      expect(state.fullAt).toBe(now + 5 * 3_600_000);
    });

    it("throws for unknown pool ID", async () => {
      const { getChargeState } = createChargeSystem({ redis: mock.redis, pools: TEST_POOLS });
      await expect(getChargeState("nonexistent")).rejects.toThrow();
    });
  });

  describe("getAllChargeStates", () => {
    it("returns states for all configured pools", async () => {
      const { getAllChargeStates } = createChargeSystem({ redis: mock.redis, pools: TEST_POOLS });
      const states = await getAllChargeStates();
      expect(states).toHaveLength(2);
      expect(states.every((s: ChargeState) => s.current === s.max)).toBe(true);
    });
  });

  describe("consumeCharge", () => {
    it("succeeds when charges are available", async () => {
      mock.setLuaHandler(() => JSON.stringify({ ok: true }));
      const { consumeCharge } = createChargeSystem({ redis: mock.redis, pools: TEST_POOLS });
      const result: ConsumeResult = await consumeCharge("photo-commentator-comment");
      expect(result.ok).toBe(true);
    });

    it("fails when charges are depleted", async () => {
      mock.setLuaHandler(() => JSON.stringify({ ok: false, retryAfterMs: 1_800_000 }));
      const { consumeCharge } = createChargeSystem({ redis: mock.redis, pools: TEST_POOLS });
      const result: ConsumeResult = await consumeCharge("photo-commentator-comment");
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.retryAfterMs).toBe(1_800_000);
      }
    });

    it("throws for unknown pool ID", async () => {
      const { consumeCharge } = createChargeSystem({ redis: mock.redis, pools: TEST_POOLS });
      await expect(consumeCharge("nonexistent")).rejects.toThrow();
    });
  });

  describe("topOff", () => {
    it("resets pool to max charges", async () => {
      const now = Date.now();
      mock.store["charge:photo-commentator-comment"] = JSON.stringify({
        current: 2,
        lastUpdatedAt: now - 1_000_000,
      });
      const { topOff, getChargeState } = createChargeSystem({ redis: mock.redis, pools: TEST_POOLS });
      await topOff("photo-commentator-comment");
      const state = await getChargeState("photo-commentator-comment");
      expect(state.current).toBe(10);
    });

    it("throws for unknown pool ID", async () => {
      const { topOff } = createChargeSystem({ redis: mock.redis, pools: TEST_POOLS });
      await expect(topOff("nonexistent")).rejects.toThrow();
    });
  });

  describe("checkCharges", () => {
    it("returns ok when all requested pools have charges", async () => {
      const { checkCharges } = createChargeSystem({ redis: mock.redis, pools: TEST_POOLS });
      const result = await checkCharges([
        "photo-commentator-comment",
        "photo-commentator-theme",
      ]);
      expect(result.ok).toBe(true);
    });

    it("returns not ok when any pool is depleted", async () => {
      const now = Date.now();
      mock.store["charge:photo-commentator-comment"] = JSON.stringify({
        current: 0,
        lastUpdatedAt: now,
      });
      const { checkCharges } = createChargeSystem({ redis: mock.redis, pools: TEST_POOLS });
      const result = await checkCharges([
        "photo-commentator-comment",
        "photo-commentator-theme",
      ]);
      expect(result.ok).toBe(false);
      expect(
        result.pools.find(
          (p: { id: string; available: boolean }) =>
            p.id === "photo-commentator-comment",
        )?.available,
      ).toBe(false);
    });
  });
});
