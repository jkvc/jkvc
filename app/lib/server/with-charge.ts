import { NextRequest, NextResponse } from "next/server";
import { consumeCharge } from "./charge-engine";

export function withCharge(
  poolId: string,
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    let result;
    try {
      result = await consumeCharge(poolId);
    } catch (err) {
      console.error(`[charge] Redis error for ${poolId}:`, err);
      return NextResponse.json(
        { error: "service_unavailable", message: "Charge system unavailable" },
        { status: 503 },
      );
    }

    if (!result.ok) {
      return NextResponse.json(
        { error: "out_of_charge", retryAfterMs: result.retryAfterMs, poolId },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)),
          },
        },
      );
    }

    return handler(req);
  };
}
