import { json, handler, putFile } from '../lib/gh.mjs';

const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif' };

export default handler(async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const { name = 'image', data = '' } = await req.json();
  const m = /^data:(image\/(?:png|jpeg|webp|svg\+xml|gif));base64,(.+)$/.exec(data);
  if (!m) return json({ error: 'Please upload a PNG, JPG, WebP, GIF or SVG image' }, 400);
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > 4 * 1024 * 1024) return json({ error: 'Image is larger than 4 MB. Please use a smaller image.' }, 400);
  const base = name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'image';
  const file = `${Date.now()}-${base}.${EXT[m[1]]}`;
  await putFile(`public/uploads/${file}`, buf, `Admin: upload ${file}`);
  return json({ path: `/uploads/${file}` });
});
