import { json, handler, checkRepo, repoInfo, passwordMode } from '../lib/gh.mjs';

export default handler(async () => {
  const repo = await checkRepo();
  const { stored } = await passwordMode();
  return json({
    ...repoInfo(), ...repo,
    passwordStoredInRepo: !!stored,
    netlifyApi: !!(process.env.NETLIFY_API_TOKEN && (process.env.NETLIFY_SITE_ID || process.env.SITE_ID)),
  });
});
