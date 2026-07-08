import "server-only";
import nodemailer from "nodemailer";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "reservas.rentacarrd@gmail.com";
// Destinatario adicional opcional para notificaciones (ej. dueño/soporte externo al equipo).
export const SECONDARY_ADMIN_EMAIL = process.env.SECONDARY_ADMIN_EMAIL || null;

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendMail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const from = `RentaCar RD <${process.env.SMTP_USER}>`;
  const transporter = createTransporter();
  await transporter.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}
