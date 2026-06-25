import { NextRequest, NextResponse } from "next/server";
import { reservaSchema } from "@/lib/validations/reserva.schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/server/audit";
import { requireApiKey } from "@/lib/server/api-auth";
import { sendMail } from "@/lib/email/mailer";
import { cotizacionClienteHtml, cotizacionAdminHtml } from "@/lib/email/templates";

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
  let query = supabase.from("reservas").select("*");

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

// Rate limiting simple en memoria (en producción usar Upstash Redis)
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutos
  const maxRequests = 20;

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
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

  // Crear reserva — precio_dia viene de la DB, no del cliente
  const insertPayload = {
    vehiculo_id: data.vehiculoId,
    nombre_cliente: data.nombreCliente,
    email_cliente: data.emailCliente,
    telefono_cliente: data.telefonoCliente,
    cedula_cliente: data.cedulaCliente,
    fecha_inicio: data.fechaInicio,
    fecha_fin: data.fechaFin,
    precio_dia: vehiculo.precio_dia,
    notas: data.notas ?? null,
  };
  const { data: reserva, error: rError } = await supabase
    .from("reservas")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertPayload as any)
    .select("id, dias, total, estado")
    .single<{ id: string; dias: number; total: number; estado: string }>();

  if (rError || !reserva) {
    // El constraint EXCLUDE de DB también puede rechazar solapamientos concurrentes
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

  // Emails de cotización (best-effort, no bloquean la respuesta)
  const adminEmail = process.env.ADMIN_EMAIL ?? "davidespinal380@gmail.com";
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

  await Promise.allSettled([
    sendMail({
      to: data.emailCliente,
      subject: `Cotización recibida #${numId} — ${vehiculo.nombre}`,
      html: cotizacionClienteHtml(emailParams),
    }),
    adminEmail
      ? sendMail({
          to: adminEmail,
          subject: `Nueva cotización #${numId} — ${vehiculo.nombre}`,
          html: cotizacionAdminHtml(emailParams),
        })
      : Promise.resolve(),
  ]);

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
