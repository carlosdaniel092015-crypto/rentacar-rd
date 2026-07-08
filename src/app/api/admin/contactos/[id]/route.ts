import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember, tieneAcceso } from "@/lib/server/equipo";

export const dynamic = "force-dynamic";

// GET /api/admin/contactos/[id] — detalle + historial de reservas
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const member = await getCurrentMember();
  if (!member || !tieneAcceso(member, "contactos")) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const supabase = await createClient();

  const [contactoRes, reservasRes] = await Promise.all([
    supabase.from("contactos").select("*").eq("id", id).single() as any,
    supabase
      .from("reservas")
      .select("id, vehiculo_id, fecha_inicio, fecha_fin, dias, precio_dia, total, estado, created_at, vehiculos(nombre, imagen_url)")
      .eq("contacto_id", id)
      .order("created_at", { ascending: false }) as any,
  ]);

  if (contactoRes.error || !contactoRes.data) return NextResponse.json({ ok: false, error: "No encontrado" }, { status: 404 });

  const data = { ...contactoRes.data, reservas: reservasRes.data ?? [] };
  return NextResponse.json({ ok: true, data });
}

// PATCH /api/admin/contactos/[id] — actualizar contacto
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const member = await getCurrentMember();
  if (!member || !tieneAcceso(member, "contactos")) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { nombre, telefono, cedula, email, notas } = body;

  if (!nombre?.trim() || !telefono?.trim() || !cedula?.trim()) {
    return NextResponse.json(
      { ok: false, error: "nombre, telefono y cedula son obligatorios" },
      { status: 422 }
    );
  }

  const supabase = createAdminClient();

  // Verificar que no haya otro contacto con mismo teléfono o cédula
  const { data: conflicto } = await supabase
    .from("contactos")
    .select("id")
    .or(`telefono.eq.${telefono.trim()},cedula.eq.${cedula.trim()}`)
    .neq("id", id)
    .limit(1)
    .single();

  if (conflicto) {
    return NextResponse.json(
      { ok: false, error: "Ya existe otro contacto con ese teléfono o cédula" },
      { status: 409 }
    );
  }

  const { data, error } = await (supabase as any)
    .from("contactos")
    .update({ nombre: nombre.trim(), telefono: telefono.trim(), cedula: cedula.trim(), email: email?.trim() ?? "", notas: notas?.trim() ?? null })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

// DELETE /api/admin/contactos/[id] — eliminar contacto (desvincula reservas)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const member = await getCurrentMember();
  if (!member || !tieneAcceso(member, "contactos")) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 403 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("contactos").delete().eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
