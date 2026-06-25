import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendMail } from "@/lib/email/mailer";

export const dynamic = "force-dynamic";

const ETIQUETAS: Record<number, string> = {
  1: "Muy malo", 2: "Malo", 3: "Regular", 4: "Bueno", 5: "Excelente",
};

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { reservaId, estrellas, comentario } = (body ?? {}) as Record<string, unknown>;

  if (!reservaId || typeof estrellas !== "number" || estrellas < 1 || estrellas > 5) {
    return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 422 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;

  // Obtener datos de la reserva para el correo
  const { data: reserva } = await supabase
    .from("reservas")
    .select("id, nombre_cliente, email_cliente, vehiculos(nombre)")
    .or(`id.eq.${reservaId},id.ilike.${reservaId}%`)
    .limit(1)
    .single();

  // Guardar la reseña
  await supabase
    .from("reservas")
    .update({
      encuesta_estrellas: estrellas,
      encuesta_comentario: typeof comentario === "string" ? comentario : null,
      encuesta_fecha: new Date().toISOString(),
    })
    .or(`id.eq.${reservaId},id.ilike.${reservaId}%`);

  // Enviar copia de la encuesta a los admins
  if (reserva) {
    const numId = (reserva.id as string).slice(0, 8).toUpperCase();
    const vehiculoNombre = reserva.vehiculos?.nombre ?? "Vehículo";
    const estrellaStr = "★".repeat(estrellas) + "☆".repeat(5 - estrellas);
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <div style="background:#1a2440;padding:24px 32px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">RentaCar RD</h1>
          <p style="color:#a0aec0;margin:4px 0 0">Nueva encuesta de satisfacción</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
          <h2 style="margin-top:0">Encuesta recibida</h2>
          <p>El cliente <strong>${reserva.nombre_cliente}</strong> calificó su experiencia con el <strong>${vehiculoNombre}</strong>.</p>
          <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:16px 0;text-align:center">
            <p style="font-size:28px;margin:0;letter-spacing:2px;color:#d97706">${estrellaStr}</p>
            <p style="font-size:18px;font-weight:700;margin:8px 0 0;color:#92400e">${ETIQUETAS[estrellas]}</p>
          </div>
          ${comentario ? `<p style="font-size:13px"><strong>Comentario:</strong> ${comentario}</p>` : ""}
          <table style="width:100%;border-collapse:collapse;margin-top:16px;font-size:13px">
            <tr style="background:#f3f4f6"><td style="padding:8px 12px;font-weight:600;width:40%"># Reserva</td><td style="padding:8px 12px">${numId}</td></tr>
            <tr><td style="padding:8px 12px;font-weight:600">Cliente</td><td style="padding:8px 12px">${reserva.nombre_cliente}</td></tr>
            <tr style="background:#f3f4f6"><td style="padding:8px 12px;font-weight:600">Correo</td><td style="padding:8px 12px">${reserva.email_cliente}</td></tr>
          </table>
        </div>
      </div>
    `;

    await Promise.allSettled([
      sendMail({
        to: [process.env.ADMIN_EMAIL ?? "reservas.rentacarrd@gmail.com", "davidespinal380@gmail.com"],
        subject: `Encuesta ${estrellaStr} — ${reserva.nombre_cliente} (#${numId})`,
        html,
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
