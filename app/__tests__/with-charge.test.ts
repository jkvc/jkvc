import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

let mockConsumeResult: unknown = { ok: true };
let mockConsumeThrows = false;

vi.mock("@/app/lib/server/charge-engine", () => ({
  consumeCharge: vi.fn(async () => {
    if (mockConsumeThrows) throw new Error("Redis connection refused");
    return mockConsumeResult;
  }),
}));

import { withCharge } from "@/app/lib/server/with-charge";

function makeRequest(): NextRequest {
  return new NextRequest("http://localhost:42096/api/test", { method: "POST" });
}

describe("withCharge", () => {
  beforeEach(() => {
    mockConsumeResult = { ok: true };
    mockConsumeThrows = false;
  });

  it("calls handler when charge is available", async () => {
    const handler = vi.fn(async () =>
      NextResponse.json({ success: true }),
    );
    const wrapped = withCharge("photo-commentator-comment", handler);
    const response = await wrapped(makeRequest());
    expect(handler).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("returns 429 with out_of_charge when depleted", async () => {
    mockConsumeResult = { ok: false, retryAfterMs: 1_800_000 };
    const handler = vi.fn();
    const wrapped = withCharge("photo-commentator-comment", handler);
    const response = await wrapped(makeRequest());
    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe("out_of_charge");
    expect(body.retryAfterMs).toBe(1_800_000);
    expect(body.poolId).toBe("photo-commentator-comment");
    expect(response.headers.get("Retry-After")).toBe("1800");
  });

  it("returns 503 when Redis is unreachable (fail-closed)", async () => {
    mockConsumeThrows = true;
    const handler = vi.fn();
    const wrapped = withCharge("photo-commentator-comment", handler);
    const response = await wrapped(makeRequest());
    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toBe("service_unavailable");
  });

  it("includes poolId in 429 response for client-side identification", async () => {
    mockConsumeResult = { ok: false, retryAfterMs: 600_000 };
    const wrapped = withCharge("image-reconstructor-animate", vi.fn());
    const response = await wrapped(makeRequest());
    const body = await response.json();
    expect(body.poolId).toBe("image-reconstructor-animate");
  });
});
