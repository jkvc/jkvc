import { NextRequest, NextResponse } from "next/server";
import { checkCharges } from "@/app/lib/server/charge-engine";

export async function GET(request: NextRequest) {
  const poolsParam = request.nextUrl.searchParams.get("pools");
  if (!poolsParam) {
    return NextResponse.json(
      { error: "Missing ?pools= query parameter" },
      { status: 400 },
    );
  }

  const poolIds = poolsParam.split(",").filter(Boolean);
  if (poolIds.length === 0) {
    return NextResponse.json(
      { error: "No pool IDs provided" },
      { status: 400 },
    );
  }

  try {
    const result = await checkCharges(poolIds);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[usage/check] Failed:", err);
    return NextResponse.json(
      { error: "service_unavailable" },
      { status: 503 },
    );
  }
}
