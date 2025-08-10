// routes/devs.js
import express from "express";
import { sendEmail } from "../utils/sendEmail.js";
import { testEmailHTML } from "../utils/emailTemplates.js";

const router = express.Router();

router.post("/email-test", async (req, res) => {
  try {
    const html = testEmailHTML({
      appName: "Savings Tracker",
      headline: "Your Gmail SMTP (465/SSL) is connected!",
      message:
        "Nice! Nodemailer successfully delivered this message via Gmail using port 465 with SSL. " +
        "You can now use the same transporter to send OTP codes for password changes.",
      ctaHref: "https://example.com", // replace or remove
      ctaLabel: "Open Dashboard",
      preheader: "SMTP test from Savings Tracker",
    });

    await sendEmail({
      to: "hadikarnib03@gmail.com",
      subject: "SMTP test ✔ Savings Tracker",
      text: "If you see this, Gmail 465/SSL works. You can now send OTP emails from your app.",
      html,
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
