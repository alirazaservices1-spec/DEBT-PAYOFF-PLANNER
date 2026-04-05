import nodemailer from "nodemailer";

const RECIPIENT = "aliraza.services1@gmail.com";

function createTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — emails will be skipped");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export interface FeedbackPayload {
  source?: string;
  trigger?: string;
  sentiment?: string;
  categories?: string[];
  otherNote?: string;
  context?: string;
  email?: string;
  consent?: boolean;
  consentTimestamp?: string;
  deviceOs?: string;
  buildVersion?: string;
  sessionId?: string;
  actionLog?: unknown[];
  ts?: string;
}

function sentimentLabel(s?: string) {
  if (s === "love") return "😄 Loving it";
  if (s === "ok") return "😐 It's okay";
  if (s === "off") return "😕 Something's off";
  return s ?? "—";
}

function htmlTable(rows: [string, string][]): string {
  const cells = rows
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding:6px 12px;font-weight:600;color:#5A3800;white-space:nowrap;border-bottom:1px solid #F0E8D0;">${k}</td>
          <td style="padding:6px 12px;color:#1C1F2E;border-bottom:1px solid #F0E8D0;">${v || "<em style='color:#aaa'>—</em>"}</td>
        </tr>`
    )
    .join("");
  return `<table style="border-collapse:collapse;width:100%;background:#FDFAF2;border-radius:8px;overflow:hidden;">${cells}</table>`;
}

export async function sendFeedbackEmail(payload: FeedbackPayload): Promise<void> {
  const transport = createTransport();
  if (!transport) return;

  const categories = Array.isArray(payload.categories) && payload.categories.length
    ? payload.categories.join(", ")
    : "—";

  const actionLog = Array.isArray(payload.actionLog) && payload.actionLog.length
    ? `<pre style="background:#F4EDD8;padding:10px;border-radius:6px;font-size:12px;overflow:auto;max-height:160px;">${
        JSON.stringify(payload.actionLog, null, 2)
      }</pre>`
    : "<em style='color:#aaa'>No action log</em>";

  const infoRows: [string, string][] = [
    ["Sentiment", sentimentLabel(payload.sentiment)],
    ["Issue chips", categories],
    ["What happened", payload.otherNote ?? ""],
    ["Context", payload.context ?? ""],
    ["User email", payload.email ?? ""],
    ["Consent", payload.consent ? `✓ Yes (${payload.consentTimestamp ?? ""})` : "No"],
    ["Trigger", payload.trigger ?? payload.source ?? ""],
    ["Device OS", payload.deviceOs ?? ""],
    ["App version", payload.buildVersion ?? ""],
    ["Session ID", payload.sessionId ?? ""],
    ["Received at", payload.ts ?? new Date().toISOString()],
  ];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'DM Sans', Arial, sans-serif; background: #F4EDD8; margin: 0; padding: 24px; }
    .card { background: #FDFAF2; border-radius: 16px; max-width: 560px; margin: 0 auto;
            border: 1.5px solid rgba(208,138,16,.2); overflow: hidden; }
    .header { background: #D08A10; padding: 20px 24px; }
    .header h1 { color: white; margin: 0; font-size: 20px; font-weight: 700; }
    .header p { color: rgba(255,255,255,.8); margin: 4px 0 0; font-size: 13px; }
    .body { padding: 20px 24px; }
    .section-title { font-size: 10px; font-weight: 700; letter-spacing: .1em;
                     text-transform: uppercase; color: #8A5000; margin: 16px 0 8px; }
    .footer { padding: 14px 24px; background: #F4EDD8; font-size: 11px;
              color: #8A7A50; border-top: 1px solid rgba(208,138,16,.15); }
  </style>
</head>
<body>
<div class="card">
  <div class="header">
    <h1>📬 New App Feedback — DebtPath</h1>
    <p>A user submitted in-app feedback</p>
  </div>
  <div class="body">
    <div class="section-title">Feedback Details</div>
    ${htmlTable(infoRows)}
    <div class="section-title">Last 10 Actions</div>
    ${actionLog}
  </div>
  <div class="footer">
    Sent automatically by DebtPath · Do not reply to this email
  </div>
</div>
</body>
</html>`;

  const text = [
    "=== DebtPath Feedback ===",
    `Sentiment:   ${sentimentLabel(payload.sentiment)}`,
    `Chips:       ${categories}`,
    `What happened: ${payload.otherNote ?? "—"}`,
    `Context:     ${payload.context ?? "—"}`,
    `User email:  ${payload.email ?? "—"}`,
    `Trigger:     ${payload.trigger ?? payload.source ?? "—"}`,
    `Device:      ${payload.deviceOs ?? "—"} v${payload.buildVersion ?? "?"}`,
    `Session:     ${payload.sessionId ?? "—"}`,
    `Time:        ${payload.ts ?? new Date().toISOString()}`,
  ].join("\n");

  await transport.sendMail({
    from: `"DebtPath Feedback" <${process.env.GMAIL_USER}>`,
    to: RECIPIENT,
    subject: `[DebtPath] ${sentimentLabel(payload.sentiment)} — new feedback`,
    text,
    html,
  });

  console.log(`[email] Feedback email sent → ${RECIPIENT}`);
}
