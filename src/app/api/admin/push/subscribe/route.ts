import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember } from "@/lib/server/equipo";

export const dynamic = "force-dynamic";

// Guarda (o actualiza) la suscripción Web Push del dispositivo del admin actual.
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "No autorizado." } }, { status: 403 });
  }

  let sub: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  try {
    sub = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION", message: "Cuerpo inválido." } }, { status: 400 });
  }

  if (!sub?.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION", message: "Suscripción inválida." } }, { status: 422 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("push_subscriptions")
    // upsert por endpoint (mismo dispositivo no se duplica)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(
      {
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        user_agent: req.headers.get("user-agent") ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      { onConflict: "endpoint" }
    );

  if (error) {
    console.error("[push] error guardando suscripción:", error);
    return NextResponse.json({ ok: false, error: { code: "SERVER_ERROR", message: "Error interno." } }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
