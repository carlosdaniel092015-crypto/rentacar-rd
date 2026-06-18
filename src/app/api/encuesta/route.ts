import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { reservaId, estrellas, comentario } = (body ?? {}) as Record<string, unknown>;

  if (!reservaId || typeof estrellas !== "number" || estrellas < 1 || estrellas > 5) {
    return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 422 });
  }

  const supabase = createAdminClient();

  // Guardar la reseña en la reserva
  const { error } = await supabase
    .from("reservas")
    .update({
      encuesta_estrellas: estrellas,
      encuesta_comentario: typeof comentario === "string" ? comentario : null,
      encuesta_fecha: new Date().toISOString(),
    } as never)
    // buscar por los primeros 8 chars del ID (el numId del email) o por UUID completo
    .or(`id.eq.${reservaId},id.ilike.${reservaId}%`);

  if (error) {
    console.error("Error guardando encuesta:", error);
    // Devolvemos ok de todos modos para no frustrar al cliente
  }

  return NextResponse.json({ ok: true });
}
