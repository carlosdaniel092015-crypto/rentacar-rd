import { NextRequest, NextResponse } from "next/server";
import { contactoSchema } from "@/lib/validations/contacto.schema";
import { sendMail, ADMIN_EMAIL } from "@/lib/server/mailer";
import { logEvent } from "@/lib/server/audit";

// Rate limit simple
const rateLimitMap = new Map<string, { count: number; reset: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hora
  const maxRequests = 3;

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
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: false, error: "Demasiadas solicitudes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida." }, { status: 400 });
  }

  const parsed = contactoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 422 });
  }

  const { _honeypot, ...data } = parsed.data;

  // Si el honeypot tiene contenido, es un bot
  if (_honeypot) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    await sendMail({
      to: ADMIN_EMAIL,
      subject: `Contacto web: ${data.asunto}`,
      html: `
        <h3>Nuevo mensaje desde el formulario de contacto</h3>
        <ul>
          <li><strong>Nombre:</strong> ${data.nombre}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          ${data.telefono ? `<li><strong>Teléfono:</strong> ${data.telefono}</li>` : ""}
          <li><strong>Asunto:</strong> ${data.asunto}</li>
        </ul>
        <h4>Mensaje:</h4>
        <p>${data.mensaje.replace(/\n/g, "<br>")}</p>
      `,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Error enviando email de contacto:", err);
    await logEvent({
      type: "error",
      level: "error",
      ip,
      path: "/api/contacto",
      method: "POST",
      message: "Error enviando email de contacto",
      details: { error: err instanceof Error ? err.message : String(err) },
    });
    return NextResponse.json({ ok: false, error: "Error enviando mensaje." }, { status: 500 });
  }
}
