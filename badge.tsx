import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentMember, tieneAcceso } from "@/lib/server/equipo";
import { logEvent } from "@/lib/server/audit";
import { sendMail } from "@/lib/server/mailer";
import {
  confirmacionClienteHtml, confirmacionAdminHtml,
  enCursoClienteHtml, enCursoAdminHtml,
  canceladaClienteHtml, canceladaAdminHtml,
  pendienteClienteHtml,
  completadaClienteHtml, completadaAdminHtml,
} from "@/lib/email/templates";

export const dynamic = "force-dynamic";

const ESTADOS = ["pendiente", "confirmada", "en_curso", "completada", "cancelada"] as const;
type Estado = (typeof ESTADOS)[number];

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/admin/reservas/[id]">) {
  const member = await getCurrentMember();
  if (!member || !tieneAcceso(member, "reservas")) {
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

  // Enviar email según el nuevo estado
  {
    const adminEmail = process.env.ADMIN_EMAIL ?? "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
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

    type MailPair = { clienteHtml: string; adminHtml?: string; clienteSubject: string; adminSubject?: string };

    const mails: MailPair | null = (() => {
      switch (nuevoEstado) {
        case "confirmada":
          return {
            clienteHtml: confirmacionClienteHtml(emailParams),
            adminHtml: confirmacionAdminHtml(emailParams),
            clienteSubject: `¡Reserva confirmada! #${numId} — ${vehiculoNombre}`,
            adminSubject: `Reserva confirmada #${numId} — ${vehiculoNombre}`,
          };
        case "en_curso":
          return {
            clienteHtml: enCursoClienteHtml(emailParams),
            adminHtml: enCursoAdminHtml(emailParams),
            clienteSubject: `Tu alquiler ha comenzado — #${numId}`,
            adminSubject: `Alquiler en curso #${numId} — ${vehiculoNombre}`,
          };
        case "cancelada":
          return {
            clienteHtml: canceladaClienteHtml(emailParams),
            adminHtml: canceladaAdminHtml(emailParams),
            clienteSubject: `Reserva cancelada #${numId}`,
            adminSubject: `Reserva cancelada #${numId} — ${vehiculoNombre}`,
          };
        case "completada":
          return {
            clienteHtml: completadaClienteHtml({ ...emailParams, siteUrl, reservaId: reserva.id }),
            adminHtml: completadaAdminHtml(emailParams),
            clienteSubject: `¡Gracias por tu alquiler! — Cuéntanos tu experiencia`,
            adminSubject: `Alquiler completado #${numId} — ${vehiculoNombre}`,
          };
        case "pendiente":
          return {
            clienteHtml: pendienteClienteHtml(emailParams),
            clienteSubject: `Reserva en revisión #${numId}`,
          };
        default:
          return null;
      }
    })();

    if (mails) {
      await Promise.allSettled([
        sendMail({ to: reserva.email_cliente, subject: mails.clienteSubject, html: mails.clienteHtml }),
        adminEmail && mails.adminHtml && mails.adminSubject
          ? sendMail({ to: adminEmail, subject: mails.adminSubject, html: mails.adminHtml })
          : Promise.resolve(),
      ]);
    }
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

// Archivar (soft-delete) o restaurar: body { accion: "archivar" | "restaurar" | "eliminar_permanente" }
export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/admin/reservas/[id]">) {
  const member = await getCurrentMember();
  if (!member || !tieneAcceso(member, "reservas")) {
    return NextResponse.json(
      { ok: false, error: { code: "FORBIDDEN", message: "No autorizado." } },
      { status: 403 }
    );
  }

  const { id } = await ctx.params;
  const supabase = createAdminClient();

  let accion: string = "archivar";
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.accion) accion = body.accion;
  } catch { /* sin body = archivar */ }

  if (accion === "eliminar_permanente" && member.rol !== "principal") {
    return NextResponse.json(
      { ok: false, error: { code: "FORBIDDEN", message: "Solo el principal puede eliminar reservas permanentemente." } },
      { status: 403 }
    );
  }

  if (accion === "eliminar_permanente") {
    const { error } = await supabase.from("reservas").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ ok: false, error: { code: "SERVER_ERROR", message: "Error eliminando." } }, { status: 500 });
    }
    await logEvent({ type: "admin_action", actorEmail: member.email, path: `/api/admin/reservas/${id}`, method: "DELETE", message: "Reserva eliminada permanentemente", details: { id } });
    return NextResponse.json({ ok: true });
  }

  if (accion === "restaurar") {
    const { error } = await supabase.from("reservas").update({ archivada: false } as never).eq("id", id);
    if (error) {
      return NextResponse.json({ ok: false, error: { code: "SERVER_ERROR", message: "Error restaurando." } }, { status: 500 });
    }
    await logEvent({ type: "admin_action", actorEmail: member.email, path: `/api/admin/reservas/${id}`, method: "DELETE", message: "Reserva restaurada", details: { id } });
    return NextResponse.json({ ok: true });
  }

  // archivar (default)
  const { error } = await supabase.from("reservas").update({ archivada: true } as never).eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, error: { code: "SERVER_ERROR", message: "Error archivando." } }, { status: 500 });
  }
  await logEvent({ type: "admin_action", actorEmail: member.email, path: `/api/admin/reservas/${id}`, method: "DELETE", message: "Reserva archivada", details: { id } });
  return NextResponse.json({ ok: true });
}
