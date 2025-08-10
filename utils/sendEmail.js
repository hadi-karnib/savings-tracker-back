// utils/sendEmail.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: true, // SSL on 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // 16-char Gmail App Password
  },
});

export async function sendEmail({ to, subject, text, html }) {
  await transporter.sendMail({
    from: `"${process.env.APP_NAME || "App"}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
    html,
  });
}
