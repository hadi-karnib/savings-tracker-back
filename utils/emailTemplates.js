// utils/emailTemplates.js
export function testEmailHTML({
  appName = "Your App",
  headline = "SMTP test is working 🎉",
  message = "If you can read this, your Gmail 465/SSL configuration is good to go.",
  ctaHref = "http://localhost:5173",
  ctaLabel = "Open App",
  footer = `${new Date().getFullYear()} © ${appName}`,
  preheader = "Your SMTP test message from " + appName,
} = {}) {
  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${appName} – Test Email</title>
    <style>
      @media (max-width:600px){ .container{ width:100% !important; } .px{ padding-left:16px !important; padding-right:16px !important; } }
      a{ text-decoration:none; }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#f6f9fc;">
    <!-- Preheader (hidden in most clients) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${preheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f9fc;">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" style="width:600px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(16,24,40,.06);">
            <!-- Header -->
            <tr>
              <td class="px" style="padding:24px 32px;background:#111827;color:#ffffff;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:16px;font-weight:600;">
                ${appName}
              </td>
            </tr>

            <!-- Hero / Headline -->
            <tr>
              <td class="px" style="padding:28px 32px 8px 32px;font-family:Inter,Segoe UI,Arial,sans-serif;">
                <h1 style="margin:0;font-size:22px;line-height:1.4;color:#0f172a;">${headline}</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td class="px" style="padding:4px 32px 20px 32px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#334155;font-size:14px;line-height:1.7;">
                ${message}
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="left" class="px" style="padding:0 32px 28px 32px;">
                <a href="${ctaHref}" target="_blank"
                   style="display:inline-block;padding:12px 18px;border-radius:10px;background:#111827;color:#ffffff;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:14px;">
                  ${ctaLabel}
                </a>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 32px;">
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;">
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="px" style="padding:18px 32px 24px 32px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#6b7280;font-size:12px;">
                You’re receiving this because a test email was triggered from <b>${appName}</b>.
                If this wasn’t you, just ignore it.
                <br><br>${footer}
              </td>
            </tr>
          </table>

          <!-- Spacer -->
          <div style="height:24px;line-height:24px;">&nbsp;</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// utils/emailTemplates.js
export function otpEmailHTML({
  appName = "Savings Tracker",
  code = "123456",
  minutes = 10,
  ctaHref = "https://stashly-kappa.vercel.app/",
  ctaLabel = "Open App",
  preheader = "Your one-time code to continue",
} = {}) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${appName} – One-Time Code</title>
  <style>@media (max-width:600px){.container{width:100%!important}.px{padding-left:16px!important;padding-right:16px!important}}</style>
</head>
<body style="margin:0;padding:0;background:#f6f9fc;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f9fc;">
    <tr><td align="center" style="padding:24px;">
      <table role="presentation" class="container" width="600" cellspacing="0" cellpadding="0" style="width:600px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(16,24,40,.06);">
        <tr>
          <td class="px" style="padding:24px 32px;background:#111827;color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:16px;font-weight:600;">
            ${appName}
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:28px 32px 12px 32px;font-family:Inter,Segoe UI,Arial,sans-serif;">
            <h1 style="margin:0;font-size:22px;line-height:1.4;color:#0f172a;">Your one-time code</h1>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:8px 32px 6px 32px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#334155;font-size:14px;line-height:1.7;">
            Use this code to continue changing your password. It expires in ${minutes} minutes.
          </td>
        </tr>
        <tr>
          <td align="left" class="px" style="padding:12px 32px 20px 32px;">
            <div style="display:inline-block;font-family:ui-monospace,Consolas,Menlo,monospace;font-size:22px;letter-spacing:4px;padding:14px 18px;border-radius:12px;background:#0f172a;color:#fff;">
              ${String(code).replace(/[^0-9]/g, "")}
            </div>
          </td>
        </tr>
        <tr>
          <td class="px" style="padding:0 32px 24px 32px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#64748b;font-size:12px;">
            If you didn’t request this, you can safely ignore this email.
          </td>
        </tr>
        <tr>
          <td align="left" class="px" style="padding:0 32px 28px 32px;">
            <a href="${ctaHref}" target="_blank" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#111827;color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:14px;">
              ${ctaLabel}
            </a>
          </td>
        </tr>
      </table>
      <div style="height:24px;line-height:24px;">&nbsp;</div>
    </td></tr>
  </table>
</body>
</html>`;
}
