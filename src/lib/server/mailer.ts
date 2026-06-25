import nodemailer from "nodemailer";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "davidespinal380@gmail.com";

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
