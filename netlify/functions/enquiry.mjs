// Receives the website enquiry, then:
//   1) emails it to you from your own mailbox (SMTP_* variables), and
//   2) adds a row to your Google Sheet (GOOGLE_SHEET_URL variable).
// Either one can be switched off by leaving its variables empty.
import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (s, n) => String(s ?? '').trim().slice(0, n);

// Who receives the email: ENQUIRY_TO variable, else "Email that receives enquiries" from the admin panel
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

async function sendEmail(d, rows) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const port = Number(SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
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
}

async function addToSheet(d) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 9000);
  try {
    const res = await fetch(process.env.GOOGLE_SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...d, secret: process.env.GOOGLE_SHEET_SECRET || '' }),
      signal: ctrl.signal,
      redirect: 'follow',
    });
    const text = await res.text();
    let out = {};
    try { out = JSON.parse(text); } catch { /* not JSON */ }
    if (!res.ok || out.ok === false) throw new Error(`Google Sheet said: ${out.error || res.status}`);
  } finally { clearTimeout(timer); }
}

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, GOOGLE_SHEET_URL } = process.env;
  const emailOn = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
  const sheetOn = !!GOOGLE_SHEET_URL;
  if (!emailOn && !sheetOn) {
    console.log('Enquiry not forwarded: neither SMTP_* nor GOOGLE_SHEET_URL is set');
    return json({ ok: false, error: 'Not configured' }, 503);
  }
  try {
    const b = await req.json();
    if (b['bot-field']) return json({ ok: true }); // spam bots fill this hidden field
    const d = {
      name: clip(b.name, 120), phone: clip(b.phone, 40), email: clip(b.email, 160),
      country: clip(b.country, 80), service: clip(b.service, 120), message: clip(b.message, 3000), page: clip(b.page, 300),
    };
    if (!d.name || !d.phone) return json({ error: 'Name and phone are required' }, 400);
    const rows = [['Name', d.name], ['Phone', d.phone], ['Email', d.email], ['Destination', d.country], ['Visa type', d.service], ['Message', d.message], ['Sent from', d.page]].filter(([, v]) => v);

    const jobs = [];
    if (emailOn) jobs.push(['email', sendEmail(d, rows)]);
    if (sheetOn) jobs.push(['sheet', addToSheet(d)]);
    const results = await Promise.allSettled(jobs.map(([, p]) => p));
    const status = {};
    results.forEach((r, i) => {
      status[jobs[i][0]] = r.status === 'fulfilled';
      if (r.status === 'rejected') console.error(`Enquiry ${jobs[i][0]} failed:`, r.reason?.message);
    });
    return json({ ok: Object.values(status).some(Boolean), ...status });
  } catch (e) {
    console.error('Enquiry handling failed:', e.message);
    return json({ ok: false, error: 'Could not process enquiry' }, 500);
  }
};
