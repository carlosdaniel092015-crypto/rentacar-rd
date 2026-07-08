import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Lectura pública (igual a lo que ya muestra el catálogo del sitio) con filtros
// pensados para automatizaciones: categoría, precio y disponibilidad por fecha.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoria = searchParams.get("categoria");
  const precioMax = searchParams.get("precioMax");
  const precioMin = searchParams.get("precioMin");
  const fechaInicio = searchParams.get("fechaInicio");
  const fechaFin = searchParams.get("fechaFin");

  if ((fechaInicio && !fechaFin) || (!fechaInicio && fechaFin)) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION", message: "fechaInicio y fechaFin deben enviarse juntas." } },
      { status: 422 }
    );
  }

  const supabase = createAdminClient();
  let query = supabase
    .from("vehiculos")
    .select(
      "id, nombre, marca, modelo, anio, categoria, transmision, combustible, pasajeros, " +
        "precio_dia, disponible, imagen_url, imagenes_urls, descripcion, caracteristicas"
    )
    .eq("disponible", true);

  if (categoria) query = query.eq("categoria", categoria);
  if (precioMin) query = query.gte("precio_dia", Number(precioMin));
  if (precioMax) query = query.lte("precio_dia", Number(precioMax));

  const { data: vehiculos, error } = await query
    .order("precio_dia", { ascending: true })
    .overrideTypes<{ id: string }[]>();

  if (error) {
    console.error("Error listando vehículos:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Error interno." } },
      { status: 500 }
    );
  }

  if (!fechaInicio || !fechaFin) {
    return NextResponse.json({ ok: true, data: vehiculos ?? [] });
  }

  // Excluir vehículos con reservas activas que se solapen con el rango pedido
  const { data: ocupados, error: rError } = await supabase
    .from("reservas")
    .select("vehiculo_id")
    .in("estado", ["pendiente", "confirmada", "en_curso"])
    .lt("fecha_inicio", fechaFin)
    .gt("fecha_fin", fechaInicio)
    .overrideTypes<{ vehiculo_id: string }[]>();

  if (rError) {
    console.error("Error consultando solapamientos:", rError);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Error interno." } },
      { status: 500 }
    );
  }

  const idsOcupados = new Set((ocupados ?? []).map((r) => r.vehiculo_id));
  const disponibles = (vehiculos ?? []).filter((v) => !idsOcupados.has(v.id));

  return NextResponse.json({ ok: true, data: disponibles });
}
