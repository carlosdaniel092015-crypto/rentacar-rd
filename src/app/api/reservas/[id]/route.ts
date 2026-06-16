import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireApiKey } from "@/lib/server/api-auth";
import { logEvent } from "@/lib/server/audit";

export const dynamic = "force-dynamic";

const ESTADOS = ["pendiente", "confirmada", "en_curso", "completada", "cancelada"] as const;
type Estado = (typeof ESTADOS)[number];

export async function GET(req: NextRequest, ctx: RouteContext<"/api/reservas/[id]">) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { id } = await ctx.params;
  const supabase = createAdminClient();
  const { data: reserva, error } = await supabase.from("reservas").select("*").eq("id", id).single();

  if (error || !reserva) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_FOUND", message: "Reserva no encontrada." } },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data: reserva });
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/reservas/[id]">) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION", message: "Cuerpo de solicitud inválido." } },
      { status: 400 }
    );
  }

  const estado = (body as { estado?: string } | null)?.estado;
  if (!estado || !ESTADOS.includes(estado as Estado)) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION", message: `estado debe ser uno de: ${ESTADOS.join(", ")}` } },
      { status: 422 }
    );
  }

  const supabase = createAdminClient();
  const { data: reserva, error } = await supabase
    .from("reservas")
    .update({ estado } as never)
    .eq("id", id)
    .select("id, estado")
    .single();

  if (error || !reserva) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_FOUND", message: "Reserva no encontrada." } },
      { status: 404 }
    );
  }

  await logEvent({
    type: "admin_action",
    path: `/api/reservas/${id}`,
    method: "PATCH",
    message: "Estado de reserva actualizado vía API de automatización",
    details: { estado },
  });

  return NextResponse.json({ ok: true, data: reserva });
}
