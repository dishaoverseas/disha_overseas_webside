// Shared helpers for the Netlify Functions: GitHub access, login tokens, passwords.
// All secrets come from Netlify environment variables, never from the code.
import crypto from 'node:crypto';

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const cfg = () => ({
  token: process.env.GITHUB_TOKEN || '',
  owner: process.env.GITHUB_OWNER || '',
  repo: process.env.GITHUB_REPO || '',
  branch: process.env.GITHUB_BRANCH || 'main',
});
export const configured = () => { const c = cfg(); return !!(c.token && c.owner && c.repo); };
export const repoInfo = () => { const c = cfg(); return { owner: c.owner, repo: c.repo, branch: c.branch }; };

async function gh(path, opt = {}) {
  const c = cfg();
  const res = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}${path}`, {
    ...opt,
    headers: {
      Authorization: `Bearer ${c.token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'disha-overseas-admin',
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}
function ghError(res, data) {
  const hint = res.status === 401 ? ' (GITHUB_TOKEN is invalid or expired)'
    : res.status === 403 ? ' (token has no write permission: give it Contents: Read and write)'
    : res.status === 404 ? ' (check GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH and that the token can access this repository)' : '';
  const e = new Error(`GitHub: ${data.message || res.status}${hint}`);
  e.status = res.status;
  return e;
}

export async function getFile(path) {
  const { branch } = cfg();
  const { res, data } = await gh(`/contents/${path}?ref=${encodeURIComponent(branch)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw ghError(res, data);
  return { sha: data.sha, text: Buffer.from(data.content || '', 'base64').toString('utf8') };
}
export async function putFile(path, buf, message, sha) {
  const { branch } = cfg();
  const { res, data } = await gh(`/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content: buf.toString('base64'), branch, ...(sha ? { sha } : {}) }),
  });
  if (!res.ok) throw ghError(res, data);
  return data;
}
export async function checkRepo() {
  const { res, data } = await gh('');
  if (!res.ok) throw ghError(res, data);
  return { canPush: !!data.permissions?.push, private: !!data.private };
}

export const CONTENT_PATH = 'content/content.json';

export async function readContent() {
  const f = await getFile(CONTENT_PATH);
  if (!f) throw new Error('content/content.json was not found in the repository');
  return JSON.parse(f.text);
}
// Replace one section and commit. Retries if someone else committed at the same moment.
export async function saveSection(key, value) {
  for (let i = 0; i < 3; i++) {
    const f = await getFile(CONTENT_PATH);
    if (!f) throw new Error('content/content.json was not found in the repository');
    const all = JSON.parse(f.text);
    if (!(key in all)) throw Object.assign(new Error('Unknown section'), { status: 400 });
    all[key] = value;
    try {
      await putFile(CONTENT_PATH, Buffer.from(JSON.stringify(all, null, 2) + '\n'), `Admin: update ${key}`, f.sha);
      return;
    } catch (e) { if (e.status !== 409 || i === 2) throw e; }
  }
}

// ---------- passwords and login tokens ----------
const AUTH_PATH = 'content/admin-auth.json'; // created when you change the password in the admin panel
const scrypt = (pw, salt) => crypto.scryptSync(String(pw), salt, 64).toString('hex');
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest();

export async function passwordMode() {
  const f = await getFile(AUTH_PATH);
  return f ? { stored: JSON.parse(f.text), sha: f.sha } : { stored: null, sha: null };
}
export async function checkPassword(pw) {
  const { stored } = await passwordMode();
  if (stored) {
    const a = Buffer.from(scrypt(pw, stored.salt), 'hex'), b = Buffer.from(stored.hash, 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  const envPw = process.env.ADMIN_PASSWORD;
  if (!envPw) throw new Error('ADMIN_PASSWORD is not set in Netlify environment variables');
  return crypto.timingSafeEqual(sha(pw), sha(envPw));
}
export async function setPassword(pw) {
  const { sha: fileSha } = await passwordMode();
  const salt = crypto.randomBytes(16).toString('hex');
  await putFile(AUTH_PATH, Buffer.from(JSON.stringify({ salt, hash: scrypt(pw, salt) }, null, 2)), 'Admin: change password', fileSha || undefined);
}

const secret = () => process.env.SESSION_SECRET || crypto.createHash('sha256').update('disha|' + (process.env.GITHUB_TOKEN || '') + '|' + (process.env.ADMIN_PASSWORD || '')).digest('hex');
const sign = (body) => crypto.createHmac('sha256', secret()).update(body).digest('base64url');
export function makeToken(hours = 12) {
  const body = Buffer.from(JSON.stringify({ exp: Date.now() + hours * 3600_000 })).toString('base64url');
  return `${body}.${sign(body)}`;
}
export function isAuthed(req) {
  const t = (req.headers.get('authorization') || '').replace('Bearer ', '');
  const [body, sig] = t.split('.');
  if (!body || !sig) return false;
  const good = sign(body);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return false;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()).exp > Date.now(); } catch { return false; }
}

// Wraps a handler: checks login, GitHub config and turns errors into JSON
export const handler = (fn, { auth = true } = {}) => async (req) => {
  try {
    if (auth && !isAuthed(req)) return json({ error: 'Please log in again' }, 401);
    if (!configured() && auth !== 'skipConfig') return json({ error: 'GitHub is not connected. Add GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO in Netlify environment variables, then redeploy.' }, 500);
    return await fn(req);
  } catch (e) {
    return json({ error: e.message || 'Something went wrong' }, e.status && e.status < 600 && e.status >= 400 ? (e.status === 401 || e.status === 403 ? 502 : e.status) : 500);
  }
};
