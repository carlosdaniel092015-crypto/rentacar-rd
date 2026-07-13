import { NextRequest, NextResponse } from "next/server";
import { contactoSchema } from "@/lib/validations/contacto.schema";
import { sendMail, ADMIN_EMAIL } from "@/lib/server/mailer";
import { logEvent } from "@/lib/server/audit";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { escapeHtml } from "@/lib/email/escape";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!(await checkRateLimit("contacto", ip, 3, 60 * 60))) {
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
          <li><strong>Nombre:</strong> ${escapeHtml(data.nombre)}</li>
          <li><strong>Email:</strong> ${escapeHtml(data.email)}</li>
          ${data.telefono ? `<li><strong>Teléfono:</strong> ${escapeHtml(data.telefono)}</li>` : ""}
          <li><strong>Asunto:</strong> ${escapeHtml(data.asunto)}</li>
        </ul>
        <h4>Mensaje:</h4>
        <p>${escapeHtml(data.mensaje).replace(/\n/g, "<br>")}</p>
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
