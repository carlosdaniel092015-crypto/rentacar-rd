import nodemailer from "nodemailer";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "davidespinal380@gmail.com";
export const SMTP_FROM = process.env.SMTP_USER ?? "reservas.rentacarrd@gmail.com";

function createTransport() {
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

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const from = `RentaCar RD <${SMTP_FROM}>`;
  const transporter = createTransport();
  await transporter.sendMail({ from, to, subject, html });
}
