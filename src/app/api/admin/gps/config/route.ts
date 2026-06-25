import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember } from "@/lib/server/equipo";

export const dynamic = "force-dynamic";

// GET — leer configuración actual (sin devolver la clave en texto plano)
export async function GET() {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });

  const supabase = createAdminClient() as any;
  const { data } = await supabase
    .from("gps_configuracion")
    .select("id, servidor_url, usuario, activo, ultimo_sync, updated_at")
    .limit(1)
    .single();

  return NextResponse.json({ ok: true, data: data ?? null });
}

// POST — guardar / actualizar credenciales
export async function POST(req: NextRequest) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { servidor_url, usuario, clave } = body;

  if (!usuario?.trim() || !clave?.trim()) {
    return NextResponse.json({ ok: false, error: "usuario y clave son obligatorios" }, { status: 422 });
  }

  const supabase = createAdminClient() as any;

  // Upsert — siempre una sola fila
  const { data: existing } = await supabase.from("gps_configuracion").select("id").limit(1).single();

  let result;
  if (existing?.id) {
    result = await supabase
      .from("gps_configuracion")
      .update({
        servidor_url: servidor_url?.trim() || "https://www.whatsgps.com",
        usuario: usuario.trim(),
        clave: clave.trim(),
        activo: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("id, servidor_url, usuario, activo")
      .single();
  } else {
    result = await supabase
      .from("gps_configuracion")
      .insert({
        servidor_url: servidor_url?.trim() || "https://www.whatsgps.com",
        usuario: usuario.trim(),
        clave: clave.trim(),
        activo: true,
      })
      .select("id, servidor_url, usuario, activo")
      .single();
  }

  if (result.error) return NextResponse.json({ ok: false, error: result.error.message }, { status: 500 });
  return NextResponse.json({ ok: true, data: result.data });
}
