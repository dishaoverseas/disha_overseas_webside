let token = sessionStorage.getItem('disha_admin_token') || '';
export const setToken = (t) => { token = t; t ? sessionStorage.setItem('disha_admin_token', t) : sessionStorage.removeItem('disha_admin_token'); };
export const hasToken = () => !!token;

// Freshly uploaded images are not on the live site until Netlify finishes building,
// so we remember a local preview for them.
export const previews = new Map();

async function req(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (res.status === 401 && url !== '/api/login') { setToken(''); window.dispatchEvent(new Event('disha-logout')); }
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status}). If you are testing locally, run "netlify dev" so the API works.`);
  return json;
}

export const api = {
  login: (password) => req('POST', '/api/login', { password }),
  content: () => req('GET', '/api/content'),
  save: (key, value) => req('PUT', '/api/content', { key, value }),
  status: () => req('GET', '/api/status'),
  enquiries: () => req('GET', '/api/enquiries'),
  password: (current, next) => req('POST', '/api/password', { current, next }),
  upload: async (name, data) => { const r = await req('POST', '/api/upload', { name, data }); previews.set(r.path, data); return r; },
};
