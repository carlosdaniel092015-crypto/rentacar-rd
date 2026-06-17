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
