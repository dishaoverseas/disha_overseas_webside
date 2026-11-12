let token = sessionStorage.getItem('disha_admin_token') || '';
export const setToken = (t) => { token = t; t ? sessionStorage.setItem('disha_admin_token', t) : sessionStorage.removeItem('disha_admin_token'); };
export const hasToken = () => !!token;

// Freshly uploaded images are not on the live site until Netlify finishes building,
// so we remember a local preview for them.
export const previews = new Map();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// If the connection drops (for example while Netlify is deploying), try again up to 2 times.
// Saving the same section twice is harmless, so retrying is safe.
async function req(method, url, body) {
  let res;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body ? JSON.stringify(body) : undefined,
      });
      break;
    } catch (e) {
      if (attempt === 2) throw new Error('Could not reach the server (connection closed). Your internet may have dropped or the site is deploying. Please wait a minute and press Save again. Check GitHub commits to see whether it already saved.');
      await sleep(1500 * (attempt + 1));
    }
  }
  const json = await res.json().catch(() => ({}));
  if (res.status === 401 && url !== '/api/login') { setToken(''); window.dispatchEvent(new Event('disha-logout')); }
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status}).`);
  return json;
}

export const api = {
  login: (password) => req('POST', '/api/login', { password }),
  content: () => req('GET', '/api/content'),
  save: (key, value) => req('PUT', '/api/content', { key, value }),
  status: () => req('GET', '/api/status'),
  test: (what) => req('POST', '/api/test', { what }),
  enquiries: () => req('GET', '/api/enquiries'),
  password: (current, next) => req('POST', '/api/password', { current, next }),
  upload: async (name, data) => { const r = await req('POST', '/api/upload', { name, data }); previews.set(r.path, data); return r; },
};