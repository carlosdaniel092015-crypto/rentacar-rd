import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember, MODULOS, type Modulo } from "@/lib/server/equipo";
import { logEvent } from "@/lib/server/audit";
import type { Database } from "@/types/database.types";

type EquipoUpdate = Database["public"]["Tables"]["equipo"]["Update"];

export const dynamic = "force-dynamic";

function validarAccesos(input: unknown): input is Modulo[] {
  return Array.isArray(input) && input.every((m) => MODULOS.includes(m));
}

// Editar cargo/accesos/rol/estado de un miembro. Solo el principal.
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/equipo/[id]">) {
  const member = await getCurrentMember();
  if (!member || member.rol !== "principal") {
    return NextResponse.json(
      { ok: false, error: { code: "FORBIDDEN", message: "Solo el principal puede editar el equipo." } },
      { status: 403 }
    );
  }

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

  const { cargo, accesos, activo, rol } = (body ?? {}) as Record<string, unknown>;
  const update: EquipoUpdate = {};

  if (cargo !== undefined) {
    if (typeof cargo !== "string" || cargo.trim().length < 2) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION", message: "Cargo inválido." } },
        { status: 422 }
      );
    }
    update.cargo = cargo.trim();
  }

  if (accesos !== undefined) {
    if (!validarAccesos(accesos)) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION", message: "Accesos inválidos." } },
        { status: 422 }
      );
    }
    update.accesos = accesos;
  }

  if (activo !== undefined) {
    if (typeof activo !== "boolean") {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION", message: "activo debe ser booleano." } },
        { status: 422 }
      );
    }
    if (id === member.id && activo === false) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION", message: "No puedes desactivar tu propia cuenta." } },
        { status: 422 }
      );
    }
    update.activo = activo;
  }

  if (rol !== undefined) {
    if (rol !== "principal" && rol !== "miembro") {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION", message: "rol debe ser principal o miembro." } },
        { status: 422 }
      );
    }
    if (id === member.id && rol === "miembro") {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION", message: "No puedes quitarte el rol de principal." } },
        { status: 422 }
      );
    }
    update.rol = rol;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION", message: "Nada que actualizar." } },
      { status: 422 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("equipo") as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .update(update)
    .eq("id", id)
    .select("id, email, nombre, cargo, rol, accesos, activo")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_FOUND", message: "Miembro no encontrado." } },
      { status: 404 }
    );
  }

  await logEvent({
    type: "admin_action",
    actorEmail: member.email,
    path: `/api/equipo/${id}`,
    method: "PATCH",
    message: "Miembro de equipo actualizado",
    details: update,
  });

  return NextResponse.json({ ok: true, data });
}
