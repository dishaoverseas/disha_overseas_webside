import { json, handler, readContent, saveSection } from '../lib/gh.mjs';

export default handler(async (req) => {
  if (req.method === 'GET') return json(await readContent());
  if (req.method === 'PUT') {
    const { key, value } = await req.json();
    if (!key || value === undefined) return json({ error: 'Missing data' }, 400);
    await saveSection(key, value);
    return json({ ok: true });
  }
  return json({ error: 'Method not allowed' }, 405);
});
