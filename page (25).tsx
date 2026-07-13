import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember, tieneAcceso } from "@/lib/server/equipo";

export const dynamic = "force-dynamic";

// GET /api/admin/contactos — lista con conteo de reservas y total gastado
export async function GET(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member || !tieneAcceso(member, "contactos")) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any;

  let query = supabase
    .from("contactos")
    .select("id, nombre, telefono, cedula, email, notas, created_at, updated_at")
    .order("nombre");

  if (q) {
    query = query.or(
      `nombre.ilike.%${q}%,telefono.ilike.%${q}%,cedula.ilike.%${q}%,email.ilike.%${q}%`
    );
  }

  const { data: contactos, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const cs: any[] = contactos ?? [];
  const ids = cs.map((c: any) => c.id);
  const statsMap = new Map<string, { count: number; total: number }>();

  if (ids.length > 0) {
    const { data: reservas } = await supabase
      .from("reservas")
      .select("contacto_id, total, estado")
      .in("contacto_id", ids);

    for (const r of reservas ?? []) {
      const prev = statsMap.get(r.contacto_id) ?? { count: 0, total: 0 };
      statsMap.set(r.contacto_id, {
        count: prev.count + 1,
        total: prev.total + (r.estado === "completada" ? (r.total ?? 0) : 0),
      });
    }
  }

  const data = cs.map((c: any) => ({
    ...c,
    reservas_count: statsMap.get(c.id)?.count ?? 0,
    total_gastado: statsMap.get(c.id)?.total ?? 0,
  }));

  return NextResponse.json({ ok: true, data });
}

// POST /api/admin/contactos — crear contacto manualmente
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member || !tieneAcceso(member, "contactos")) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const { nombre, telefono, cedula, email, notas } = body;

  if (!nombre?.trim() || !telefono?.trim() || !cedula?.trim()) {
    return NextResponse.json(
      { ok: false, error: "nombre, telefono y cedula son obligatorios" },
      { status: 422 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  const { data: existente } = await supabase
    .from("contactos")
    .select("id, nombre, telefono, cedula")
    .or(`telefono.eq.${telefono.trim()},cedula.eq.${cedula.trim()}`)
    .limit(1)
    .single();

  if (existente) {
    return NextResponse.json(
      {
        ok: false,
        error: `Ya existe un contacto con ese ${existente.telefono === telefono.trim() ? "teléfono" : "cédula/pasaporte"}: ${existente.nombre}`,
        contacto_id: existente.id,
      },
      { status: 409 }
    );
  }

  const { data: nuevo, error } = await supabase
    .from("contactos")
    .insert({ nombre: nombre.trim(), telefono: telefono.trim(), cedula: cedula.trim(), email: email?.trim() ?? "", notas: notas?.trim() ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data: nuevo }, { status: 201 });
}
