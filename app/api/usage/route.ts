import { NextResponse } from "next/server";
import { getAllChargeStates } from "@/app/lib/server/charge-engine";

export async function GET() {
  try {
    const states = await getAllChargeStates();
    return NextResponse.json({ pools: states });
  } catch (err) {
    console.error("[usage] Failed to fetch charge states:", err);
    return NextResponse.json(
      { error: "service_unavailable" },
      { status: 503 },
    );
  }
}
