import { json, handler } from '../lib/gh.mjs';

// Reads contact-form submissions from Netlify Forms (optional: needs NETLIFY_API_TOKEN)
export default handler(async () => {
  const token = process.env.NETLIFY_API_TOKEN;
  const site = process.env.NETLIFY_SITE_ID || process.env.SITE_ID;
  if (!token || !site) return json({ configured: false, items: [] });
  const r = await fetch(`https://api.netlify.com/api/v1/sites/${site}/submissions?per_page=100`, { headers: { Authorization: `Bearer ${token}` } });
  const j = await r.json();
  if (!r.ok) return json({ configured: true, items: [], error: j.message || `Netlify returned ${r.status}` });
  return json({ configured: true, items: j.map((s) => ({ id: s.id, created_at: s.created_at, data: s.data })) });
});
