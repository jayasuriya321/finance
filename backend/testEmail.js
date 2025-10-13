import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const testEmail = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Finance App" <${process.env.SMTP_USER}>`,
      to: "your-email@example.com", // replace with your email
      subject: "Test Email",
      text: "SMTP is working!",
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

testEmail();
