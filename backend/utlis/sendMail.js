// backend/utlis/sendMail.js
import nodemailer from "nodemailer";

let transporter;
export const sendMail = async ({ to, subject, text, html, attachments = [] }) => {
  try {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === "true", // true for 465, false for others
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    }

    await transporter.sendMail({
      from: `"Finance App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
      attachments,
    });

    console.log("✅ Email sent to", to);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
};
