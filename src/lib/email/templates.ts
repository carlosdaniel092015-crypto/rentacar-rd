function base(contenido: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#1a2440;padding:24px 32px;border-radius:8px 8px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px">RentaCar RD</h1>
        <p style="color:#a0aec0;margin:4px 0 0">República Dominicana</p>
      </div>
      <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px">
        ${contenido}
        <p style="color:#718096;font-size:12px;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px">
          RentaCar RD · República Dominicana<br>
          Este es un correo automático, no respondas a este mensaje.
        </p>
      </div>
    </div>
  `;
}

function tablaReserva({
  nombreCliente,
  emailCliente,
  telefonoCliente,
  cedulaCliente,
  vehiculoNombre,
  fechaInicio,
  fechaFin,
  dias,
  precioDia,
  total,
  notas,
}: {
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  cedulaCliente: string;
  vehiculoNombre: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  precioDia: number;
  total: number;
  notas?: string | null;
}) {
  const fmt = (n: number) => n.toLocaleString("es-DO");
  const desglose = `${dias} ${dias === 1 ? "día" : "días"} × RD$${fmt(precioDia)} = RD$${fmt(total)}`;

  const filas = [
    ["Nombre completo", nombreCliente],
    ["Correo electrónico", emailCliente],
    ["Teléfono", telefonoCliente],
    ["Cédula / Pasaporte", cedulaCliente],
    ["Vehículo", vehiculoNombre],
    ["Fecha inicio", fechaInicio],
    ["Fecha fin", fechaFin],
    ["Monto", `<strong>${desglose}</strong>`],
    ...(notas ? [["Notas adicionales", notas] as [string, string]] : []),
  ];

  const rows = filas
    .map(([label, value], i) =>
      `<tr style="background:${i % 2 === 0 ? "#f3f4f6" : "#fff"}">
        <td style="padding:8px 12px;font-weight:600;width:40%;font-size:13px">${label}</td>
        <td style="padding:8px 12px;font-size:13px">${value}</td>
      </tr>`
    )
    .join("");

  return `<table style="width:100%;border-collapse:collapse;margin:16px 0">${rows}</table>`;
}

// ─── Cotización recibida (al crear la reserva) ──────────────────────────────

export function cotizacionClienteHtml(params: {
  numId: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  cedulaCliente: string;
  vehiculoNombre: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  precioDia: number;
  total: number;
  notas?: string | null;
}) {
  return base(`
    <h2 style="margin-top:0">¡Hola, ${params.nombreCliente}!</h2>
    <p>Tu cotización fue registrada exitosamente. Un agente se pondrá en contacto contigo pronto para confirmar la disponibilidad.</p>
    <p style="font-size:13px;color:#718096"># Cotización: <strong>${params.numId}</strong></p>
    ${tablaReserva(params)}
    <p style="margin-top:16px;font-size:13px;color:#718096">
      El pago se realiza al momento de recoger el vehículo. No se realiza ningún cobro anticipado.
    </p>
  `);
}

export function cotizacionAdminHtml(params: Parameters<typeof cotizacionClienteHtml>[0]) {
  return base(`
    <h2 style="margin-top:0">Nueva cotización recibida</h2>
    <p style="font-size:13px;color:#718096"># Cotización: <strong>${params.numId}</strong></p>
    ${tablaReserva(params)}
    <p style="margin-top:16px;font-size:13px">Ingresa al panel para gestionar esta reserva.</p>
  `);
}

// ─── Confirmación de reserva (cuando admin cambia a "confirmada") ────────────

export function confirmacionClienteHtml(params: {
  numId: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  cedulaCliente: string;
  vehiculoNombre: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  precioDia: number;
  total: number;
  notas?: string | null;
}) {
  return base(`
    <h2 style="margin-top:0">¡Reserva confirmada, ${params.nombreCliente}!</h2>
    <p>Nos complace informarte que tu reserva ha sido <strong style="color:#16a34a">confirmada</strong>. Te esperamos en la fecha acordada.</p>
    <p style="font-size:13px;color:#718096"># Reserva: <strong>${params.numId}</strong></p>
    ${tablaReserva(params)}
    <p style="margin-top:16px;font-size:13px;color:#718096">
      El pago se realiza al momento de recoger el vehículo. Si tienes alguna pregunta, contáctanos por WhatsApp.
    </p>
  `);
}

export function confirmacionAdminHtml(params: Parameters<typeof confirmacionClienteHtml>[0]) {
  return base(`
    <h2 style="margin-top:0">Reserva confirmada</h2>
    <p>Se marcó la siguiente reserva como <strong style="color:#16a34a">confirmada</strong>.</p>
    <p style="font-size:13px;color:#718096"># Reserva: <strong>${params.numId}</strong></p>
    ${tablaReserva(params)}
  `);
}

// ─── Tipos compartidos ────────────────────────────────────────────────────────

type ParamsEstado = {
  numId: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  cedulaCliente: string;
  vehiculoNombre: string;
  fechaInicio: string;
  fechaFin: string;
  dias: number;
  precioDia: number;
  total: number;
  notas?: string | null;
};

// ─── En curso ─────────────────────────────────────────────────────────────────

export function enCursoClienteHtml(params: ParamsEstado) {
  return base(`
    <h2 style="margin-top:0">¡Tu alquiler ha comenzado, ${params.nombreCliente}!</h2>
    <p>El vehículo <strong>${params.vehiculoNombre}</strong> está ahora bajo tu cuidado. Que tengas un excelente viaje.</p>
    <p style="font-size:13px;color:#718096"># Reserva: <strong>${params.numId}</strong></p>
    ${tablaReserva(params)}
    <div style="background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 16px;border-radius:4px;margin-top:16px;font-size:13px">
      <strong>Recuerda:</strong> Devuelve el vehículo con el mismo nivel de combustible y en el mismo estado en que lo recibiste.
      Ante cualquier incidente, contáctanos de inmediato.
    </div>
  `);
}

export function enCursoAdminHtml(params: ParamsEstado) {
  return base(`
    <h2 style="margin-top:0">Reserva en curso</h2>
    <p>El alquiler del vehículo <strong>${params.vehiculoNombre}</strong> ha sido marcado como <strong style="color:#2563eb">en curso</strong>.</p>
    <p style="font-size:13px;color:#718096"># Reserva: <strong>${params.numId}</strong></p>
    ${tablaReserva(params)}
  `);
}

// ─── Cancelada ────────────────────────────────────────────────────────────────

export function canceladaClienteHtml(params: ParamsEstado) {
  return base(`
    <h2 style="margin-top:0">Reserva cancelada</h2>
    <p>Hola ${params.nombreCliente}, te informamos que tu reserva ha sido <strong style="color:#dc2626">cancelada</strong>.</p>
    <p style="font-size:13px;color:#718096"># Reserva: <strong>${params.numId}</strong></p>
    ${tablaReserva(params)}
    <p style="margin-top:16px;font-size:13px;color:#718096">
      Si deseas realizar una nueva reserva o tienes preguntas, no dudes en contactarnos.
    </p>
  `);
}

export function canceladaAdminHtml(params: ParamsEstado) {
  return base(`
    <h2 style="margin-top:0">Reserva cancelada</h2>
    <p>La reserva <strong>#${params.numId}</strong> de <strong>${params.nombreCliente}</strong> ha sido <strong style="color:#dc2626">cancelada</strong>.</p>
    ${tablaReserva(params)}
  `);
}

// ─── Pendiente ────────────────────────────────────────────────────────────────

export function pendienteClienteHtml(params: ParamsEstado) {
  return base(`
    <h2 style="margin-top:0">Reserva en revisión</h2>
    <p>Hola ${params.nombreCliente}, tu reserva ha sido marcada como <strong style="color:#d97706">pendiente de revisión</strong>. Nuestro equipo la evaluará y te notificará pronto.</p>
    <p style="font-size:13px;color:#718096"># Reserva: <strong>${params.numId}</strong></p>
    ${tablaReserva(params)}
  `);
}

// ─── Completada + Encuesta ────────────────────────────────────────────────────

export function completadaClienteHtml(params: ParamsEstado & { siteUrl: string }) {
  const encuestaUrl = `${params.siteUrl}/encuesta/${params.numId}`;
  const fmt = (n: number) => n.toLocaleString("es-DO");
  return base(`
    <h2 style="margin-top:0">¡Gracias por elegirnos, ${params.nombreCliente}!</h2>
    <p>Tu alquiler del <strong>${params.vehiculoNombre}</strong> ha sido completado. Esperamos que hayas tenido una excelente experiencia.</p>
    <p style="font-size:13px;color:#718096"># Reserva: <strong>${params.numId}</strong> · ${params.dias} días · RD$${fmt(params.total)}</p>

    <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
      <p style="font-size:16px;font-weight:600;margin:0 0 8px">¿Cómo fue tu experiencia?</p>
      <p style="font-size:13px;color:#718096;margin:0 0 16px">Tus comentarios nos ayudan a mejorar. Solo toma 1 minuto.</p>
      <a href="${encuestaUrl}"
         style="background:#16a34a;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">
        Calificar mi experiencia →
      </a>
    </div>

    <p style="font-size:12px;color:#718096;text-align:center">
      O copia este enlace en tu navegador: ${encuestaUrl}
    </p>
  `);
}

export function completadaAdminHtml(params: ParamsEstado) {
  return base(`
    <h2 style="margin-top:0">Alquiler completado</h2>
    <p>La reserva de <strong>${params.nombreCliente}</strong> ha sido marcada como <strong style="color:#16a34a">completada</strong>. Se envió encuesta de satisfacción al cliente.</p>
    <p style="font-size:13px;color:#718096"># Reserva: <strong>${params.numId}</strong></p>
    ${tablaReserva(params)}
  `);
}
