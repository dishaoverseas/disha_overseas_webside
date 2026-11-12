// Disha Overseas server: shows the website and runs the admin panel API.
// No database. Everything you edit in /admin is saved in data/content.json on this server, and is live instantly.
// Only dependency: nodemailer (for enquiry emails).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createBackup } from './backup.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ---------- tiny .env loader ----------
try {
  for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
} catch { /* no .env file */ }

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0'; // on a VPS the firewall only opens 80 and 443, so port 3000 stays private
const DIST = path.join(ROOT, 'dist');
const DATA = process.env.DATA_DIR || path.join(ROOT, 'data');
const UPLOADS = path.join(DATA, 'uploads');
const BACKUPS = path.join(DATA, 'backups');
const CONTENT_FILE = path.join(DATA, 'content.json');
const SEED_FILE = path.join(ROOT, 'content', 'content.json');
const AUTH_FILE = path.join(DATA, 'auth.json');
const ENQ_FILE = path.join(DATA, 'enquiries.json');
const SECRET_FILE = path.join(DATA, 'secret.txt');

for (const d of [DATA, UPLOADS, BACKUPS]) fs.mkdirSync(d, { recursive: true });

// Safety copy on GitHub (separate branch). Restored inside init() below, before the content is loaded.
const backup = createBackup({ contentFile: CONTENT_FILE, uploadsDir: UPLOADS });

// ---------- content store ----------
const readJson = (f, fallback) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; } };
let content = {};
let ready = false;

// Runs once after the server has started. (No top-level await: some hosts load this file with require().)
async function init() {
  if (backup.enabled() && (await backup.restore())) console.log('Restored missing data from the GitHub backup');
  const seed = readJson(SEED_FILE, {});
  let loaded = readJson(CONTENT_FILE, null);
  if (!loaded) { loaded = seed; fs.writeFileSync(CONTENT_FILE, JSON.stringify(loaded, null, 2) + '\n'); }
  // New sections added by code updates appear automatically, your edits are never overwritten
  let added = false;
  for (const [k, v] of Object.entries(seed)) if (!(k in loaded)) { loaded[k] = v; added = true; }
  if (added) fs.writeFileSync(CONTENT_FILE, JSON.stringify(loaded, null, 2) + '\n');
  content = loaded;
  ready = true;
  console.log('Content loaded. Website is ready.');
}

function saveContent() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  if (fs.existsSync(CONTENT_FILE)) fs.copyFileSync(CONTENT_FILE, path.join(BACKUPS, `content-${stamp}.json`));
  const files = fs.readdirSync(BACKUPS).filter((f) => f.startsWith('content-')).sort();
  for (const f of files.slice(0, Math.max(0, files.length - 60))) fs.unlinkSync(path.join(BACKUPS, f));
  const tmp = CONTENT_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(content, null, 2) + '\n');
  fs.renameSync(tmp, CONTENT_FILE); // atomic: the file is never half written
  backup.schedule();
}

// ---------- helpers ----------
const json = (res, status, obj) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(obj));
};
const readBody = (req, limit = 25 * 1024 * 1024) => new Promise((resolve, reject) => {
  const chunks = []; let n = 0;
  req.on('data', (c) => { n += c.length; if (n > limit) { reject(Object.assign(new Error('Request too large'), { status: 413 })); req.destroy(); return; } chunks.push(c); });
  req.on('end', () => resolve(Buffer.concat(chunks)));
  req.on('error', reject);
});
const readJsonBody = async (req) => { try { return JSON.parse((await readBody(req)).toString('utf8') || '{}'); } catch (e) { if (e.status) throw e; throw Object.assign(new Error('Invalid data'), { status: 400 }); } };
const ipOf = (req) => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (s, n) => String(s ?? '').trim().slice(0, n);

// simple in-memory rate limiter
const buckets = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const b = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  if (b.length >= max) { buckets.set(key, b); return true; }
  b.push(now); buckets.set(key, b); return false;
}

// ---------- passwords and login tokens ----------
const scrypt = (pw, salt) => crypto.scryptSync(String(pw), salt, 64).toString('hex');
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();
function secret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (!fs.existsSync(SECRET_FILE)) fs.writeFileSync(SECRET_FILE, crypto.randomBytes(32).toString('hex'), { mode: 0o600 });
  return fs.readFileSync(SECRET_FILE, 'utf8').trim();
}
function checkPassword(pw) {
  const stored = readJson(AUTH_FILE, null);
  if (stored) {
    const a = Buffer.from(scrypt(pw, stored.salt), 'hex'), b = Buffer.from(stored.hash, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  if (!process.env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD is not set in the .env file on the server');
  return crypto.timingSafeEqual(sha(pw), sha(process.env.ADMIN_PASSWORD));
}
function setPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ salt, hash: scrypt(pw, salt) }), { mode: 0o600 });
}
const sign = (body) => crypto.createHmac('sha256', secret()).update(body).digest('base64url');
const makeToken = (hours = 12) => { const b = Buffer.from(JSON.stringify({ exp: Date.now() + hours * 3600_000 })).toString('base64url'); return `${b}.${sign(b)}`; };
function isAuthed(req) {
  const [body, sig] = String(req.headers.authorization || '').replace('Bearer ', '').split('.');
  if (!body || !sig) return false;
  const good = sign(body);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return false;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}

// ---------- enquiries: saved here, then emailed and added to Google Sheet ----------
function saveEnquiry(d) {
  const all = readJson(ENQ_FILE, []);
  all.unshift({ id: crypto.randomUUID(), created_at: new Date().toISOString(), data: d });
  fs.writeFileSync(ENQ_FILE, JSON.stringify(all.slice(0, 3000), null, 1));
}
function recipient() {
  return process.env.ENQUIRY_TO || content.settings?.enquiryEmail || content.settings?.email || process.env.SMTP_USER;
}
async function sendEmail(d, rows) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const nodemailer = (await import('nodemailer')).default;
  const port = Number(SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS }, connectionTimeout: 10000, greetingTimeout: 10000 });
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
// Result of the last email / sheet attempt, shown in Admin > Server status
const integ = { email: { ok: null, error: null, at: null }, sheet: { ok: null, error: null, at: null } };
const mark = (kind, ok, err) => { integ[kind] = { ok, error: ok ? null : String(err || 'Unknown error').slice(0, 400), at: new Date().toISOString() }; };

async function addToSheet(d) {
  const url = process.env.GOOGLE_SHEET_URL || '';
  if (!/^https:\/\/script\.google(usercontent)?\.com\/.+\/exec/.test(url)) {
    throw new Error('GOOGLE_SHEET_URL must be the Web app link that ends with /exec (not /dev, and not the link of the sheet itself).');
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...d, secret: process.env.GOOGLE_SHEET_SECRET || '', notifyTo: process.env.EMAIL_VIA_SHEET ? recipient() : '' }), signal: ctrl.signal, redirect: 'follow',
    });
    const text = await res.text();
    let out;
    try { out = JSON.parse(text); } catch {
      throw new Error('Google sent back a web page instead of the expected reply. In Apps Script open Deploy > Manage deployments: "Who has access" must be "Anyone", and after any code change create a New version and authorize again. Reply started with: ' + text.slice(0, 90).replace(/\s+/g, ' '));
    }
    if (out.ok !== true) throw new Error(`Google Sheet said: ${out.error || 'unknown error'}` + (out.error === 'wrong secret' ? ' (GOOGLE_SHEET_SECRET on the server must be exactly the same word as SECRET in the script)' : ''));
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Google Sheet did not answer within 15 seconds');
    throw e;
  } finally { clearTimeout(timer); }
}

// ---------- SEO files ----------
function baseUrl(req) { return (content.settings?.siteUrl || `https://${req.headers.host}`).replace(/\/$/, ''); }
function sitemap(req) {
  const b = baseUrl(req);
  const urls = ['/', '/about', '/destinations', '/services', '/russia-visa', '/blog', '/faq', '/contact',
    ...(content.destinations || []).filter((d) => !d.link).map((d) => `/destinations/${d.slug}`),
    ...(content.services || []).map((s) => `/services/${s.slug}`),
    ...(content.blog || []).map((x) => `/blog/${x.slug}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${b}${u}</loc></url>`).join('\n')}\n</urlset>\n`;
}

// ---------- API ----------
async function api(req, res, url) {
  const route = `${req.method} ${url.pathname}`;

  if (route === 'GET /api/health') return json(res, 200, { ok: true });

  if (route === 'POST /api/login') {
    if (limited('login:' + ipOf(req), 8, 15 * 60_000)) return json(res, 429, { error: 'Too many attempts. Please wait 15 minutes.' });
    const { password = '' } = await readJsonBody(req);
    let ok;
    try { ok = checkPassword(password); } catch (e) { return json(res, 500, { error: e.message }); }
    if (!ok) return json(res, 401, { error: 'Wrong password' });
    return json(res, 200, { token: makeToken() });
  }

  if (route === 'POST /api/enquiry') { // public: the website form
    if (limited('enq:' + ipOf(req), 10, 60 * 60_000)) return json(res, 429, { error: 'Too many enquiries. Please try again later.' });
    const b = await readJsonBody(req);
    if (b['bot-field']) return json(res, 200, { ok: true }); // spam bots fill this hidden field
    const d = { name: clip(b.name, 120), phone: clip(b.phone, 40), email: clip(b.email, 160), country: clip(b.country, 80), service: clip(b.service, 120), message: clip(b.message, 3000), page: clip(b.page, 300) };
    if (!d.name || !d.phone) return json(res, 400, { error: 'Name and phone are required' });
    saveEnquiry(d);
    const rows = [['Name', d.name], ['Phone', d.phone], ['Email', d.email], ['Destination', d.country], ['Visa type', d.service], ['Message', d.message], ['Sent from', d.page]].filter(([, v]) => v);
    const emailOn = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    const sheetOn = !!process.env.GOOGLE_SHEET_URL;
    const jobs = [];
    if (emailOn) jobs.push(['email', sendEmail(d, rows)]);
    if (sheetOn) jobs.push(['sheet', addToSheet(d)]);
    const results = await Promise.allSettled(jobs.map(([, p]) => p));
    const status = { saved: true };
    results.forEach((r, i) => {
      status[jobs[i][0]] = r.status === 'fulfilled';
      mark(jobs[i][0], r.status === 'fulfilled', r.reason?.message);
      if (r.status === 'rejected') console.error(`Enquiry ${jobs[i][0]} failed:`, r.reason?.message);
    });
    return json(res, 200, { ok: true, ...status });
  }

  // everything below needs the admin login
  if (!isAuthed(req)) return json(res, 401, { error: 'Please log in again' });

  if (route === 'GET /api/content') return json(res, 200, content);

  if (route === 'PUT /api/content') {
    const { key, value } = await readJsonBody(req);
    if (!key || value === undefined) return json(res, 400, { error: 'Missing data' });
    if (!(key in content)) return json(res, 400, { error: 'Unknown section' });
    content[key] = value;
    saveContent();
    return json(res, 200, { ok: true });
  }

  if (route === 'POST /api/upload') {
    const { name = 'image', data = '' } = await readJsonBody(req);
    const m = /^data:(image\/(?:png|jpeg|webp|svg\+xml|gif));base64,(.+)$/.exec(data);
    if (!m) return json(res, 400, { error: 'Please upload a PNG, JPG, WebP, GIF or SVG image' });
    const buf = Buffer.from(m[2], 'base64');
    if (buf.length > 8 * 1024 * 1024) return json(res, 400, { error: 'Image is larger than 8 MB' });
    const ext = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif' }[m[1]];
    const base = String(name).replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image';
    const file = `${Date.now()}-${base}.${ext}`;
    fs.writeFileSync(path.join(UPLOADS, file), buf);
    backup.schedule();
    return json(res, 200, { path: `/uploads/${file}` });
  }

  if (route === 'POST /api/password') {
    const { current = '', next = '' } = await readJsonBody(req);
    let ok; try { ok = checkPassword(current); } catch (e) { return json(res, 500, { error: e.message }); }
    if (!ok) return json(res, 400, { error: 'Current password is wrong' });
    if (String(next).length < 8) return json(res, 400, { error: 'New password must be at least 8 characters' });
    setPassword(next);
    return json(res, 200, { ok: true });
  }

  if (route === 'POST /api/test') {
    const { what } = await readJsonBody(req);
    const d = { name: 'TEST from admin panel', phone: '0000000000', email: '', country: '', service: '', message: 'This is a test message from the admin panel. You can delete this row or email.', page: 'admin test' };
    const rows = [['Name', d.name], ['Phone', d.phone], ['Message', d.message]];
    try {
      if (what === 'sheet') {
        if (!process.env.GOOGLE_SHEET_URL) throw new Error('GOOGLE_SHEET_URL is not set in the server settings (environment variables). Add it, then redeploy.');
        await addToSheet(d); mark('sheet', true);
      } else if (what === 'email') {
        if (!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)) throw new Error('SMTP_HOST, SMTP_USER or SMTP_PASS is not set in the server settings (environment variables).');
        await sendEmail(d, rows); mark('email', true);
      } else return json(res, 400, { error: 'Unknown test' });
      return json(res, 200, { ok: true });
    } catch (e) { mark(what, false, e.message); return json(res, 200, { ok: false, error: e.message }); }
  }

  if (route === 'GET /api/enquiries') return json(res, 200, { configured: true, items: readJson(ENQ_FILE, []) });

  if (route === 'GET /api/status') {
    return json(res, 200, {
      mode: 'vps',
      node: process.version,
      uptimeHours: Math.round(process.uptime() / 36) / 100,
      enquiries: readJson(ENQ_FILE, []).length,
      backups: fs.readdirSync(BACKUPS).length,
      emailOn: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      emailTo: recipient() || '',
      sheetOn: !!process.env.GOOGLE_SHEET_URL,
      sheetLast: integ.sheet,
      emailLast: integ.email,
      passwordChanged: fs.existsSync(AUTH_FILE),
      backupOn: backup.enabled(),
      backupLast: backup.state.last,
      backupError: backup.state.error,
      dataDir: DATA,
    });
  }

  return json(res, 404, { error: 'Not found' });
}

// ---------- safety: build the website files if the hosting did not ----------
let building = false;
let lastBuildTry = 0;
function ensureBuilt() {
  if (fs.existsSync(path.join(DIST, 'index.html')) || building) return;
  if (Date.now() - lastBuildTry < 5 * 60_000) return; // do not retry more than once every 5 minutes
  lastBuildTry = Date.now();
  building = true;
  console.log('Website files (dist) not found. Building now, this takes 1 to 2 minutes...');
  const child = spawn('npm', ['run', 'build'], { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
  child.on('exit', (code) => { building = false; console.log(code === 0 ? 'Build finished.' : `Build failed (exit code ${code}).`); });
  child.on('error', (e) => { building = false; console.error('Could not start the build:', e.message); });
}

// ---------- website files ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.map': 'application/json' };
const isFile = (f) => { try { return fs.statSync(f).isFile(); } catch { return false; } };

const COMPRESSIBLE = /^(text\/|application\/(json|javascript|xml)|image\/svg)/;
const gzipCache = new Map();
const acceptsGzip = (req) => /\bgzip\b/.test(String(req.headers['accept-encoding'] || ''));

function serveFile(req, res, file, cache) {
  const st = fs.statSync(file);
  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const headers = { 'content-type': type, 'cache-control': cache, vary: 'Accept-Encoding' };
  if (st.size > 1024 && COMPRESSIBLE.test(type) && acceptsGzip(req)) {
    const key = file + st.mtimeMs;
    let buf = gzipCache.get(key);
    if (!buf) {
      buf = zlib.gzipSync(fs.readFileSync(file), { level: 9 });
      gzipCache.set(key, buf);
      if (gzipCache.size > 200) gzipCache.delete(gzipCache.keys().next().value);
    }
    res.writeHead(200, { ...headers, 'content-encoding': 'gzip', 'content-length': buf.length });
    return res.end(buf);
  }
  res.writeHead(200, { ...headers, 'content-length': st.size });
  fs.createReadStream(file).pipe(res);
}

function sendText(req, res, type, body, extra = {}) {
  const buf = Buffer.from(body);
  const headers = { 'content-type': type, vary: 'Accept-Encoding', ...extra };
  if (buf.length > 1024 && acceptsGzip(req)) {
    const z = zlib.gzipSync(buf);
    res.writeHead(200, { ...headers, 'content-encoding': 'gzip', 'content-length': z.length });
    return res.end(z);
  }
  res.writeHead(200, { ...headers, 'content-length': buf.length });
  res.end(buf);
}

function renderIndex(req, pagePath = '/') {
  const file = path.join(DIST, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  const s = content.settings || {};
  const base = baseUrl(req);
  const abs = (u) => (!u ? '' : /^https?:/.test(u) ? u : base + (u.startsWith('/') ? u : '/' + u));
  const safeJson = (o) => JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  const title = s.seo?.title || s.siteName || 'Disha Overseas';
  const desc = s.seo?.description || '';
  const cleanPath = pagePath === '/' ? '/' : pagePath.replace(/\/+$/, '');
  const url = base + (cleanPath === '/' ? '' : cleanPath);
  const image = abs(s.seo?.image || s.logo);

  const sameAs = Object.values(s.social || {}).filter((u) => /^https?:/.test(u));
  const org = {
    '@context': 'https://schema.org', '@type': 'Organization', name: s.siteName, url: base,
    logo: abs(s.logo), ...(s.phone ? { telephone: s.phone } : {}), ...(s.email ? { email: s.email } : {}),
    ...(s.address ? { address: { '@type': 'PostalAddress', streetAddress: s.address, addressCountry: 'IN' } } : {}),
    ...(sameAs.length ? { sameAs: [...new Set(sameAs)] } : {}),
  };
  const tags = [];
  if (/^[A-Za-z0-9_-]{20,80}$/.test(String(s.googleVerification || '').trim())) tags.push(`<meta name="google-site-verification" content="${esc(String(s.googleVerification).trim())}" />`);
  tags.push(`<link rel="canonical" href="${esc(url)}" />`);
  tags.push(`<meta property="og:type" content="website" />`, `<meta property="og:site_name" content="${esc(s.siteName || '')}" />`,
    `<meta property="og:title" content="${esc(title)}" />`, `<meta property="og:description" content="${esc(desc)}" />`, `<meta property="og:url" content="${esc(url)}" />`);
  if (image) tags.push(`<meta property="og:image" content="${esc(image)}" />`, `<meta name="twitter:card" content="summary" />`);
  tags.push(`<script type="application/ld+json">${safeJson(org)}</script>`);
  tags.push(`<script>window.__CONTENT__=${safeJson(content)}</script>`);
  html = html.replace('</head>', () => `${tags.join('\n')}\n</head>`);
  if (s.seo?.title) html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${esc(s.seo.title)}</title>`);
  if (s.seo?.description) html = html.replace(/<meta name="description" content="[^"]*"/, () => `<meta name="description" content="${esc(s.seo.description)}"`);
  if (s.favicon) html = html.replace('href="/favicon.png"', () => `href="${esc(s.favicon)}"`);
  return html;
}

function website(req, res, url) {
  let p;
  try { p = decodeURIComponent(url.pathname); } catch { res.writeHead(400); return res.end('Bad request'); }

  if (p === '/sitemap.xml') return sendText(req, res, 'application/xml', sitemap(req), { 'cache-control': 'no-cache' });
  if (p === '/robots.txt') return sendText(req, res, 'text/plain', `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${baseUrl(req)}/sitemap.xml\n`);

  if (p.startsWith('/uploads/')) {
    const name = path.basename(p);
    for (const dir of [UPLOADS, path.join(ROOT, 'public', 'uploads')]) {
      const f = path.join(dir, name);
      if (isFile(f)) return serveFile(req, res, f, 'public, max-age=2592000');
    }
    res.writeHead(404); return res.end('Not found');
  }

  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    ensureBuilt();
    res.writeHead(503, { 'content-type': 'text/html; charset=utf-8', 'retry-after': '30', 'cache-control': 'no-store' });
    return res.end('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Updating</title><body style="font-family:sans-serif;text-align:center;padding:15vh 20px"><h1>We are updating our website</h1><p>Please refresh this page in a minute.</p>');
  }

  const f = path.normalize(path.join(DIST, p));
  if (f.startsWith(DIST + path.sep) && isFile(f) && !p.endsWith('/')) {
    return serveFile(req, res, f, p.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'public, max-age=3600');
  }

  if (p === '/admin' || p.startsWith('/admin/')) {
    const a = path.join(DIST, 'admin', 'index.html');
    if (isFile(a)) return sendText(req, res, MIME['.html'], fs.readFileSync(a, 'utf8'), { 'cache-control': 'no-store', 'x-robots-tag': 'noindex' });
  }

  return sendText(req, res, MIME['.html'], renderIndex(req, p), { 'cache-control': 'no-cache' });
}

// ---------- server ----------
const server = http.createServer(async (req, res) => {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'SAMEORIGIN');
  res.setHeader('referrer-policy', 'strict-origin-when-cross-origin');
  if (req.headers['x-forwarded-proto'] === 'https') res.setHeader('strict-transport-security', 'max-age=31536000');
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/health') return json(res, 200, { ok: true, ready });
    if (!ready) { res.writeHead(503, { 'content-type': 'text/plain; charset=utf-8', 'retry-after': '5' }); return res.end('Starting up, please refresh in a few seconds.'); }
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end('Method not allowed'); }
    return website(req, res, url);
  } catch (e) {
    console.error('Request failed:', req.method, req.url, e.message);
    if (!res.headersSent) json(res, e.status || 500, { error: e.status ? e.message : 'Something went wrong' });
    else res.end();
  }
});
server.listen(PORT, HOST, () => console.log(`Disha Overseas running on port ${PORT}  (data folder: ${DATA})`));
init().catch((e) => { console.error('Start-up failed:', e); });
ensureBuilt();                                     // build the website files if they are missing
setTimeout(() => backup.run(), 20_000);            // sync once after start
setInterval(() => backup.run(), 6 * 3600_000);     // and every 6 hours
// Never let one bad request stop the whole site
process.on('uncaughtException', (e) => console.error('Uncaught error:', e));
process.on('unhandledRejection', (e) => console.error('Unhandled rejection:', e));
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => server.close(() => process.exit(0)));