import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/lib/server/admin-auth";
import { topOff, getChargeState } from "@/app/lib/server/charge-engine";
import { getPool } from "@/app/lib/server/charge-config";

export async function POST(request: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { poolId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { poolId } = body;
  if (!poolId || !getPool(poolId)) {
    return NextResponse.json(
      { error: "Invalid or missing poolId" },
      { status: 400 },
    );
  }

  try {
    await topOff(poolId);
    const state = await getChargeState(poolId);
    return NextResponse.json({ pool: state });
  } catch (err) {
    console.error("[admin/topoff] Failed:", err);
    return NextResponse.json(
      { error: "service_unavailable" },
      { status: 503 },
    );
  }
}
