import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  computeRecharge,
  type ChargeState,
  type ConsumeResult,
} from "@/app/lib/server/charge-engine";

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
    // lastUpdatedAt advances by 1 full interval, preserving 0.5 interval progress
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
    // When capped, advance lastUpdatedAt to now to avoid accumulating stale time
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
    // retryAfterMs = interval - (elapsed % interval)
    expect(result.retryAfterMs).toBeCloseTo(0.7 * INTERVAL_MS, 0);
  });
});

// --------------------------------------------------------------------------
// Redis-backed operations (mocked)
// --------------------------------------------------------------------------

const mockStore: Record<string, string> = {};
let luaHandler: ((...args: unknown[]) => unknown) | null = null;

vi.mock("@/app/lib/server/redis", () => ({
  getRedis: () => ({
    get: vi.fn((key: string) => Promise.resolve(mockStore[key] ?? null)),
    set: vi.fn((key: string, value: string) => {
      mockStore[key] = value;
      return Promise.resolve("OK");
    }),
    eval: vi.fn(
      (
        script: string,
        numKeys: number,
        ...args: unknown[]
      ) => {
        if (luaHandler) return Promise.resolve(luaHandler(script, numKeys, ...args));
        return Promise.resolve(null);
      },
    ),
  }),
}));

describe("charge-engine Redis operations", () => {
  beforeEach(() => {
    for (const key of Object.keys(mockStore)) delete mockStore[key];
    luaHandler = null;
  });

  describe("getChargeState", () => {
    it("returns fully charged state for a new pool", async () => {
      const { getChargeState } = await import("@/app/lib/server/charge-engine");
      const state = await getChargeState("photo-commentator-comment");
      expect(state.current).toBe(10);
      expect(state.max).toBe(10);
      expect(state.rechargeIntervalHours).toBe(1);
      expect(state.nextRechargeAt).toBeNull();
      expect(state.fullAt).toBeNull();
    });

    it("computes nextRechargeAt when not full", async () => {
      const now = Date.now();
      mockStore["charge:photo-commentator-comment"] = JSON.stringify({
        current: 5,
        lastUpdatedAt: now,
      });
      const { getChargeState } = await import("@/app/lib/server/charge-engine");
      const state = await getChargeState("photo-commentator-comment");
      expect(state.current).toBe(5);
      expect(state.nextRechargeAt).toBe(now + 3_600_000);
      expect(state.fullAt).toBe(now + 5 * 3_600_000);
    });

    it("throws for unknown pool ID", async () => {
      const { getChargeState } = await import("@/app/lib/server/charge-engine");
      await expect(getChargeState("nonexistent")).rejects.toThrow();
    });
  });

  describe("getAllChargeStates", () => {
    it("returns states for all configured pools", async () => {
      const { getAllChargeStates } = await import(
        "@/app/lib/server/charge-engine"
      );
      const states = await getAllChargeStates();
      expect(states).toHaveLength(7);
      expect(states.every((s: ChargeState) => s.current === s.max)).toBe(true);
    });
  });

  describe("consumeCharge", () => {
    it("succeeds when charges are available", async () => {
      const now = Date.now();
      mockStore["charge:photo-commentator-comment"] = JSON.stringify({
        current: 5,
        lastUpdatedAt: now,
      });
      luaHandler = () => JSON.stringify({ ok: true });
      const { consumeCharge } = await import("@/app/lib/server/charge-engine");
      const result: ConsumeResult = await consumeCharge(
        "photo-commentator-comment",
      );
      expect(result.ok).toBe(true);
    });

    it("fails when charges are depleted", async () => {
      luaHandler = () =>
        JSON.stringify({ ok: false, retryAfterMs: 1_800_000 });
      const { consumeCharge } = await import("@/app/lib/server/charge-engine");
      const result: ConsumeResult = await consumeCharge(
        "photo-commentator-comment",
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.retryAfterMs).toBe(1_800_000);
      }
    });

    it("throws for unknown pool ID", async () => {
      const { consumeCharge } = await import("@/app/lib/server/charge-engine");
      await expect(consumeCharge("nonexistent")).rejects.toThrow();
    });
  });

  describe("topOff", () => {
    it("resets pool to max charges", async () => {
      const { topOff, getChargeState } = await import(
        "@/app/lib/server/charge-engine"
      );
      const now = Date.now();
      mockStore["charge:photo-commentator-comment"] = JSON.stringify({
        current: 2,
        lastUpdatedAt: now - 1_000_000,
      });
      await topOff("photo-commentator-comment");
      const state = await getChargeState("photo-commentator-comment");
      expect(state.current).toBe(10);
    });

    it("throws for unknown pool ID", async () => {
      const { topOff } = await import("@/app/lib/server/charge-engine");
      await expect(topOff("nonexistent")).rejects.toThrow();
    });
  });

  describe("checkCharges", () => {
    it("returns ok when all requested pools have charges", async () => {
      const { checkCharges } = await import("@/app/lib/server/charge-engine");
      const result = await checkCharges([
        "photo-commentator-comment",
        "photo-commentator-theme",
      ]);
      expect(result.ok).toBe(true);
    });

    it("returns not ok when any pool is depleted", async () => {
      const now = Date.now();
      mockStore["charge:photo-commentator-comment"] = JSON.stringify({
        current: 0,
        lastUpdatedAt: now,
      });
      const { checkCharges } = await import("@/app/lib/server/charge-engine");
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
