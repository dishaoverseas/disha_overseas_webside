import { json, checkPassword, passwordMode, makeToken, configured } from '../lib/gh.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    if (!configured()) return json({ error: 'GitHub is not connected yet. Add GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO in Netlify environment variables and redeploy.' }, 500);
    const { password = '' } = await req.json().catch(() => ({}));
    if (!(await checkPassword(password))) {
      await new Promise((r) => setTimeout(r, 800)); // slows down guessing
      return json({ error: 'Wrong password' }, 401);
    }
    const { stored } = await passwordMode();
    return json({ token: makeToken(), usingEnvPassword: !stored });
  } catch (e) {
    return json({ error: e.message }, 500);
  }
};
