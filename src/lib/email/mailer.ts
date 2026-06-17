import nodemailer from "nodemailer";

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
  const from = `RentaCar RD <${process.env.SMTP_USER}>`;
  const transporter = createTransport();
  await transporter.sendMail({ from, to, subject, html });
}
