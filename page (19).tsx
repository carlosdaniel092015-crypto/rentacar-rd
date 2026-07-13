import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember } from "@/lib/server/equipo";

export const dynamic = "force-dynamic";

// Lista las notificaciones recientes del panel + cuántas sin leer.
export async function GET() {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "No autorizado." } }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notificaciones")
    .select("id, tipo, titulo, mensaje, url, leida, created_at")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    return NextResponse.json({ ok: false, error: { code: "SERVER_ERROR", message: "Error interno." } }, { status: 500 });
  }

  const items = data ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noLeidas = items.filter((n: any) => !n.leida).length;
  return NextResponse.json({ ok: true, data: items, noLeidas });
}

// Marca notificaciones como leídas (todas, o una por id).
export async function PATCH(req: Request) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "No autorizado." } }, { status: 403 });
  }

  let id: string | undefined;
  try {
    const body = await req.json();
    id = body?.id;
  } catch {
    // sin body → marcar todas
  }

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase.from("notificaciones") as any).update({ leida: true });
  query = id ? query.eq("id", id) : query.eq("leida", false);
  const { error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: { code: "SERVER_ERROR", message: "Error interno." } }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
