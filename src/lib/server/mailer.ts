import nodemailer from "nodemailer";

export const ADMIN_EMAIL = "davidespinal380@gmail.com";
export const FROM_EMAIL = "RentaCar RD <reservas.rentacarrd@gmail.com>";

export function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
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
  const transporter = createTransporter();
  await transporter.sendMail({
    from: FROM_EMAIL,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}
