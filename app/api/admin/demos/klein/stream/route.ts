import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/app/lib/server/admin-auth";
import {
  buildKleinStreamPayload,
  getModalStreamConfig,
  type KleinStreamRequest,
} from "@/app/lib/server/modal";

export async function POST(request: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: KleinStreamRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let modalPayload: Record<string, unknown>;
  try {
    modalPayload = buildKleinStreamPayload(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let modalConfig: ReturnType<typeof getModalStreamConfig>;
  try {
    modalConfig = getModalStreamConfig();
  } catch (err) {
    console.error("[admin/klein/stream] Missing Modal config:", err);
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }

  let modalResponse: Response;
  try {
    modalResponse = await fetch(modalConfig.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Modal-Key": modalConfig.key,
        "Modal-Secret": modalConfig.secret,
      },
      body: JSON.stringify(modalPayload),
    });
  } catch (err) {
    console.error("[admin/klein/stream] Modal fetch failed:", err);
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }

  if (!modalResponse.ok || !modalResponse.body) {
    const detail = await modalResponse.text().catch(() => "");
    console.error(
      "[admin/klein/stream] Modal error:",
      modalResponse.status,
      detail.slice(0, 500),
    );
    return NextResponse.json(
      { error: "modal_error", status: modalResponse.status },
      { status: 502 },
    );
  }

  return new Response(modalResponse.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
