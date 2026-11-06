// Receives the website enquiry and emails it to you.
// It is sent FROM your own mailbox (for example admin@dishaoverseas.in) using SMTP.
// Settings come from Netlify environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (and optional ENQUIRY_TO).
import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (s, n) => String(s ?? '').trim().slice(0, n);

// Who receives the enquiry: ENQUIRY_TO variable, else the "Email that receives enquiries" set in the admin panel
function recipient() {
  if (process.env.ENQUIRY_TO) return process.env.ENQUIRY_TO;
  try {
    for (const base of [process.cwd(), process.env.LAMBDA_TASK_ROOT].filter(Boolean)) {
      const f = path.join(base, 'content', 'content.json');
      if (fs.existsSync(f)) {
        const c = JSON.parse(fs.readFileSync(f, 'utf8'));
        const to = c.settings?.enquiryEmail || c.settings?.email;
        if (to) return to;
      }
    }
  } catch { /* fall through */ }
  return process.env.SMTP_USER;
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('Enquiry email skipped: SMTP_HOST, SMTP_USER or SMTP_PASS is not set');
    return json({ ok: false, error: 'Email is not configured' }, 503);
  }
  try {
    const b = await req.json();
    if (b['bot-field']) return json({ ok: true }); // spam bots fill this hidden field
    const d = {
      name: clip(b.name, 120), phone: clip(b.phone, 40), email: clip(b.email, 160),
      country: clip(b.country, 80), service: clip(b.service, 120), message: clip(b.message, 3000), page: clip(b.page, 300),
    };
    if (!d.name || !d.phone) return json({ error: 'Name and phone are required' }, 400);

    const port = Number(SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });

    const rows = [['Name', d.name], ['Phone', d.phone], ['Email', d.email], ['Destination', d.country], ['Visa type', d.service], ['Message', d.message], ['Sent from', d.page]].filter(([, v]) => v);
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email);
    await transporter.sendMail({
      from: `"Disha Overseas Website" <${SMTP_USER}>`,
      to: recipient(),
      replyTo: validEmail ? d.email : undefined,
      subject: `New visa enquiry from ${d.name}${d.country ? ' (' + d.country + ')' : ''}`,
      text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
      html: `<h2 style="font-family:Arial">New visa enquiry</h2><table style="font-family:Arial;border-collapse:collapse">${rows
        .map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#555"><b>${esc(k)}</b></td><td style="padding:6px 0">${esc(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}</table>`,
    });
    return json({ ok: true });
  } catch (e) {
    console.error('Enquiry email failed:', e.message);
    return json({ ok: false, error: 'Could not send email' }, 500);
  }
};
