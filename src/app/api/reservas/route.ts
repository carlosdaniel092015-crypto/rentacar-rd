import { NextRequest, NextResponse } from "next/server";
import { reservaSchema } from "@/lib/validations/reserva.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/server/audit";
import { requireApiKey } from "@/lib/server/api-auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { sendMail, ADMIN_EMAIL, SECONDARY_ADMIN_EMAIL } from "@/lib/server/mailer";
import { cotizacionClienteHtml, cotizacionAdminHtml } from "@/lib/email/templates";
import { upsertContacto } from "@/lib/server/contactos";
import { enviarPush } from "@/lib/server/push";

export const dynamic = "force-dynamic";

const ESTADOS = ["pendiente", "confirmada", "en_curso", "completada", "cancelada"] as const;

// Búsqueda de reservas para automatizaciones externas (requiere API key, expone PII).
export async function GET(req: NextRequest) {
  const authError = requireApiKey(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const cedula = searchParams.get("cedula");
  const email = searchParams.get("email");
  const estado = searchParams.get("estado");

  if (estado && !ESTADOS.includes(estado as (typeof ESTADOS)[number])) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION", message: `estado debe ser uno de: ${ESTADOS.join(", ")}` } },
      { status: 422 }
    );
  }

  const supabase = createAdminClient();
  let query = supabase.from("reservas").select(
    "id, vehiculo_id, contacto_id, nombre_cliente, email_cliente, telefono_cliente, cedula_cliente, " +
      "fecha_inicio, fecha_fin, dias, precio_dia, total, estado, notas, archivada, " +
      "encuesta_estrellas, encuesta_comentario, encuesta_fecha, created_at, updated_at"
  );

  if (id) query = query.eq("id", id);
  if (cedula) query = query.eq("cedula_cliente", cedula);
  if (email) query = query.eq("email_cliente", email);
  if (estado) query = query.eq("estado", estado);

  const { data: reservas, error } = await query.order("created_at", { ascending: false }).limit(100);

  if (error) {
    console.error("Error listando reservas:", error);
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Error interno." } },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, data: reservas ?? [] });
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!(await checkRateLimit("reservas", ip, 5, 10 * 60))) {
    return NextResponse.json(
      { ok: false, error: { code: "RATE_LIMIT", message: "Demasiadas solicitudes. Intenta más tarde." } },
      { status: 429 }
    );
  }

  // Parse y validar body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION", message: "Cuerpo de solicitud inválido." } },
      { status: 400 }
    );
  }

  const parsed = reservaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "VALIDATION",
          message: "Datos inválidos.",
          issues: parsed.error.issues,
        },
      },
      { status: 422 }
    );
  }

  const data = parsed.data;
  const supabase = createAdminClient();

  // Verificar que el vehículo existe y está disponible
  const { data: vehiculo, error: vError } = await supabase
    .from("vehiculos")
    .select("id, nombre, precio_dia, disponible")
    .eq("id", data.vehiculoId)
    .single<{ id: string; nombre: string; precio_dia: number; disponible: boolean }>();

  if (vError || !vehiculo) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION", message: "Vehículo no encontrado." } },
      { status: 404 }
    );
  }

  if (!vehiculo.disponible) {
    return NextResponse.json(
      { ok: false, error: { code: "NO_DISPONIBLE", message: "Este vehículo no está disponible." } },
      { status: 409 }
    );
  }

  // Verificar solapamiento de fechas en la capa aplicativa (doble barrera con DB constraint)
  const { data: solapadas } = await supabase
    .from("reservas")
    .select("id")
    .eq("vehiculo_id", data.vehiculoId)
    .in("estado", ["pendiente", "confirmada", "en_curso"])
    .lt("fecha_inicio", data.fechaFin)
    .gt("fecha_fin", data.fechaInicio)
    .limit(1);

  if (solapadas && solapadas.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FECHAS_OCUPADAS",
          message: "Esas fechas ya están reservadas para este vehículo.",
        },
      },
      { status: 409 }
    );
  }

  // Upsert contacto (deduplicación por teléfono o cédula)
  const contactoId = await upsertContacto({
    nombre: data.nombreCliente,
    telefono: data.telefonoCliente,
    cedula: data.cedulaCliente,
    email: data.emailCliente,
  });

  // Crear reserva — precio_dia viene de la DB, no del cliente
  const insertPayload = {
    vehiculo_id: data.vehiculoId,
    contacto_id: contactoId,
    nombre_cliente: data.nombreCliente,
    email_cliente: data.emailCliente,
    telefono_cliente: data.telefonoCliente,
    cedula_cliente: data.cedulaCliente,
    fecha_inicio: data.fechaInicio,
    fecha_fin: data.fechaFin,
    precio_dia: vehiculo.precio_dia,
    notas: data.notas ?? null,
    idempotency_key: data.idempotencyKey ?? null,
  };
  const { data: reserva, error: rError } = await supabase
    .from("reservas")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertPayload as any)
    .select("id, dias, total, estado")
    .single<{ id: string; dias: number; total: number; estado: string }>();

  if (rError || !reserva) {
    // Idempotencia: si este mismo envío ya creó una reserva (misma clave), el
    // índice único dispara 23505. Devolvemos la reserva original SIN duplicar ni
    // reenviar correos → un doble-click/reintento "solo toma 1".
    if (rError?.code === "23505" && data.idempotencyKey) {
      const { data: existente } = await supabase
        .from("reservas")
        .select("id, dias, total, estado")
        .eq("idempotency_key", data.idempotencyKey)
        .single<{ id: string; dias: number; total: number; estado: string }>();
      if (existente) {
        return NextResponse.json(
          { ok: true, data: { id: existente.id, total: existente.total, dias: existente.dias, estado: existente.estado } },
          { status: 200 }
        );
      }
    }
    if (rError?.code === "23P01") {
      return NextResponse.json(
        { ok: false, error: { code: "FECHAS_OCUPADAS", message: "Esas fechas ya están ocupadas." } },
        { status: 409 }
      );
    }
    console.error("Error creando reserva:", { code: rError?.code, msg: rError?.message });
    await logEvent({
      type: "error",
      level: "error",
      ip,
      path: "/api/reservas",
      method: "POST",
      message: "Error creando reserva",
      details: { code: rError?.code, msg: rError?.message },
    });
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Error interno. Intenta nuevamente." } },
      { status: 500 }
    );
  }

  // Enviar confirmación al cliente y notificación al admin (plantillas que ya escapan HTML)
  const numId = reserva.id.slice(0, 8).toUpperCase();
  const emailParams = {
    numId,
    nombreCliente: data.nombreCliente,
    emailCliente: data.emailCliente,
    telefonoCliente: data.telefonoCliente,
    cedulaCliente: data.cedulaCliente,
    vehiculoNombre: vehiculo.nombre,
    fechaInicio: data.fechaInicio,
    fechaFin: data.fechaFin,
    dias: reserva.dias,
    precioDia: vehiculo.precio_dia,
    total: reserva.total,
    notas: data.notas ?? null,
  };

  const emailResults = await Promise.allSettled([
    sendMail({
      to: data.emailCliente,
      subject: `Reserva recibida — ${vehiculo.nombre}`,
      html: cotizacionClienteHtml(emailParams),
    }),
    sendMail({
      to: [...new Set([ADMIN_EMAIL, ...(SECONDARY_ADMIN_EMAIL ? [SECONDARY_ADMIN_EMAIL] : [])])],
      subject: `Nueva reserva — ${vehiculo.nombre} (${numId})`,
      html: cotizacionAdminHtml(emailParams),
    }),
  ]);

  for (const result of emailResults) {
    if (result.status === "rejected") {
      console.error("Error enviando email:", result.reason);
    }
  }

  // Notificación interna para el panel (campana). Best-effort.
  try {
    await supabase.from("notificaciones").insert({
      tipo: "reserva",
      titulo: "Nueva reserva",
      mensaje: `${data.nombreCliente} reservó ${vehiculo.nombre} (${data.fechaInicio} → ${data.fechaFin})`,
      url: "/admin/reservas",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  } catch (err) {
    console.error("Error creando notificación:", err);
  }

  // Notificación push nativa a los dispositivos del panel. Best-effort.
  void enviarPush({
    title: "Nueva reserva",
    body: `${data.nombreCliente} reservó ${vehiculo.nombre}`,
    url: "/admin/reservas",
  }).catch((err: unknown) => console.error("Error enviando push:", err));

  return NextResponse.json(
    {
      ok: true,
      data: {
        id: reserva.id,
        total: reserva.total,
        dias: reserva.dias,
        estado: reserva.estado,
      },
    },
    { status: 201 }
  );
}
