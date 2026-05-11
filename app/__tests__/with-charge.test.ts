import { describe, it, expect, beforeEach } from "vitest";
import { createChargeSystem, type ChargeRedis, type ChargePoolConfig } from "next-charge";

const TEST_POOLS: ChargePoolConfig[] = [
  { id: "photo-commentator-comment", maxCharges: 10, rechargeIntervalHours: 1 },
];

function createMockRedis(luaResult?: unknown, shouldThrow = false): ChargeRedis {
  return {
    get: async () => null,
    set: async () => "OK",
    eval: async () => {
      if (shouldThrow) throw new Error("Redis connection refused");
      return typeof luaResult === "string" ? luaResult : JSON.stringify(luaResult);
    },
  };
}

function makeRequest(): Request {
  return new Request("http://localhost:42096/api/test", { method: "POST" });
}

describe("withCharge", () => {
  it("calls handler when charge is available", async () => {
    const redis = createMockRedis({ ok: true });
    const { withCharge } = createChargeSystem({ redis, pools: TEST_POOLS });

    let handlerCalled = false;
    const handler = async () => {
      handlerCalled = true;
      return Response.json({ success: true });
    };
    const wrapped = withCharge("photo-commentator-comment", handler);
    const response = await wrapped(makeRequest());
    expect(handlerCalled).toBe(true);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("returns 429 with out_of_charge when depleted", async () => {
    const redis = createMockRedis({ ok: false, retryAfterMs: 1_800_000 });
    const { withCharge } = createChargeSystem({ redis, pools: TEST_POOLS });

    let handlerCalled = false;
    const wrapped = withCharge("photo-commentator-comment", async () => {
      handlerCalled = true;
      return Response.json({});
    });
    const response = await wrapped(makeRequest());
    expect(handlerCalled).toBe(false);
    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe("out_of_charge");
    expect(body.retryAfterMs).toBe(1_800_000);
    expect(body.poolId).toBe("photo-commentator-comment");
    expect(response.headers.get("Retry-After")).toBe("1800");
  });

  it("returns 503 when Redis is unreachable (fail-closed)", async () => {
    const redis = createMockRedis(null, true);
    const { withCharge } = createChargeSystem({ redis, pools: TEST_POOLS });

    let handlerCalled = false;
    const wrapped = withCharge("photo-commentator-comment", async () => {
      handlerCalled = true;
      return Response.json({});
    });
    const response = await wrapped(makeRequest());
    expect(handlerCalled).toBe(false);
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toBe("service_unavailable");
  });

  it("includes poolId in 429 response for client-side identification", async () => {
    const redis = createMockRedis({ ok: false, retryAfterMs: 600_000 });
    const { withCharge } = createChargeSystem({ redis, pools: [
      { id: "image-reconstructor-animate", maxCharges: 3, rechargeIntervalHours: 4 },
    ]});

    const wrapped = withCharge("image-reconstructor-animate", async () => Response.json({}));
    const response = await wrapped(makeRequest());
    const body = await response.json();
    expect(body.poolId).toBe("image-reconstructor-animate");
  });
});
