import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember } from "@/lib/server/equipo";
import { logEvent } from "@/lib/server/audit";
import { sendMail } from "@/lib/email/mailer";
import { confirmacionClienteHtml, confirmacionAdminHtml } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

const ESTADOS = ["pendiente", "confirmada", "en_curso", "completada", "cancelada"] as const;
type Estado = (typeof ESTADOS)[number];

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/admin/reservas/[id]">) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json(
      { ok: false, error: { code: "FORBIDDEN", message: "No autorizado." } },
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

  const nuevoEstado = (body as { estado?: string } | null)?.estado as Estado | undefined;
  if (!nuevoEstado || !ESTADOS.includes(nuevoEstado)) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION", message: `estado debe ser uno de: ${ESTADOS.join(", ")}` } },
      { status: 422 }
    );
  }

  const supabase = createAdminClient();

  // Obtener reserva completa antes de actualizar (necesitamos datos para el email)
  const { data: reserva, error: fetchError } = await supabase
    .from("reservas")
    .select("*, vehiculos(nombre, precio_dia)")
    .eq("id", id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .single<any>();

  if (fetchError || !reserva) {
    return NextResponse.json(
      { ok: false, error: { code: "NOT_FOUND", message: "Reserva no encontrada." } },
      { status: 404 }
    );
  }

  // Actualizar estado de la reserva
  const { error: updateError } = await supabase
    .from("reservas")
    .update({ estado: nuevoEstado } as never)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Error actualizando estado." } },
      { status: 500 }
    );
  }

  // Sincronizar disponibilidad del vehículo
  await (supabase.from("vehiculos") as any)
    .update({ disponible: nuevoEstado !== "confirmada" })
    .eq("id", reserva.vehiculo_id);

  // Enviar email de confirmación al cliente y admin cuando el estado es "confirmada"
  if (nuevoEstado === "confirmada") {
    const adminEmail = process.env.ADMIN_EMAIL ?? "";
    const numId = (reserva.id as string).slice(0, 8).toUpperCase();
    const vehiculoNombre = reserva.vehiculos?.nombre ?? "Vehículo";
    const precioDia = reserva.vehiculos?.precio_dia ?? reserva.precio_dia ?? 0;

    const emailParams = {
      numId,
      nombreCliente: reserva.nombre_cliente,
      emailCliente: reserva.email_cliente,
      telefonoCliente: reserva.telefono_cliente,
      cedulaCliente: reserva.cedula_cliente,
      vehiculoNombre,
      fechaInicio: reserva.fecha_inicio,
      fechaFin: reserva.fecha_fin,
      dias: reserva.dias,
      precioDia,
      total: reserva.total,
      notas: reserva.notas ?? null,
    };

    await Promise.allSettled([
      sendMail({
        to: reserva.email_cliente,
        subject: `¡Reserva confirmada! #${numId} — ${vehiculoNombre}`,
        html: confirmacionClienteHtml(emailParams),
      }),
      adminEmail
        ? sendMail({
            to: adminEmail,
            subject: `Reserva confirmada #${numId} — ${vehiculoNombre}`,
            html: confirmacionAdminHtml(emailParams),
          })
        : Promise.resolve(),
    ]);
  }

  await logEvent({
    type: "admin_action",
    actorEmail: member.email,
    path: `/api/admin/reservas/${id}`,
    method: "PATCH",
    message: `Estado de reserva actualizado a "${nuevoEstado}"`,
    details: { id, estado: nuevoEstado },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/admin/reservas/[id]">) {
  const member = await getCurrentMember();
  if (!member) {
    return NextResponse.json(
      { ok: false, error: { code: "FORBIDDEN", message: "No autorizado." } },
      { status: 403 }
    );
  }

  const { id } = await ctx.params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("reservas").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Error eliminando reserva." } },
      { status: 500 }
    );
  }

  await logEvent({
    type: "admin_action",
    actorEmail: member.email,
    path: `/api/admin/reservas/${id}`,
    method: "DELETE",
    message: "Reserva eliminada",
    details: { id },
  });

  return NextResponse.json({ ok: true });
}
