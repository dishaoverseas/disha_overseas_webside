import { json, handler, checkPassword, setPassword } from '../lib/gh.mjs';

export default handler(async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const { current = '', next = '' } = await req.json();
  if (!(await checkPassword(current))) return json({ error: 'Current password is wrong' }, 400);
  if (next.length < 8) return json({ error: 'New password must be at least 8 characters' }, 400);
  await setPassword(next);
  return json({ ok: true });
});
