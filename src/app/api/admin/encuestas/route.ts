import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember } from "@/lib/server/equipo";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const estrellas = searchParams.get("estrellas");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  let query = supabase
    .from("reservas")
    .select("id, nombre_cliente, email_cliente, vehiculo_id, fecha_inicio, fecha_fin, total, encuesta_estrellas, encuesta_comentario, encuesta_fecha, vehiculos(nombre)")
    .not("encuesta_estrellas", "is", null)
    .order("encuesta_fecha", { ascending: false });

  if (estrellas) {
    query = query.eq("encuesta_estrellas", Number(estrellas));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const encuestas = (data ?? []).map((r: any) => ({
    id: r.id,
    numId: (r.id as string).slice(0, 8).toUpperCase(),
    nombreCliente: r.nombre_cliente,
    emailCliente: r.email_cliente,
    vehiculoNombre: r.vehiculos?.nombre ?? "—",
    fechaInicio: r.fecha_inicio,
    fechaFin: r.fecha_fin,
    total: r.total,
    estrellas: r.encuesta_estrellas,
    comentario: r.encuesta_comentario,
    fechaEncuesta: r.encuesta_fecha,
  }));

  const total = encuestas.length;
  const promedio = total > 0
    ? encuestas.reduce((sum: number, e: any) => sum + e.estrellas, 0) / total
    : 0;

  const distribucion = [1, 2, 3, 4, 5].map((n) => ({
    estrellas: n,
    count: encuestas.filter((e: any) => e.estrellas === n).length,
  }));

  return NextResponse.json({ ok: true, data: encuestas, stats: { total, promedio, distribucion } });
}
