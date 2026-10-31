import React, { useCallback, useEffect, useState } from 'react';
import { api, setToken, hasToken } from './api.js';
import { SECTIONS, slugify } from './schema.js';
import { Field } from './fields.jsx';

/* ---------------- Login ---------------- */
function Login({ onDone }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try { const r = await api.login(pw); setToken(r.token); onDone(); } catch (ex) { setErr(ex.message); }
    setBusy(false);
  }
  return (
    <div className="login">
      <form onSubmit={submit} className="login-card">
        <img src="/logo.png" alt="Disha Overseas" />
        <h1>Admin panel</h1>
        <label className="field"><span className="label">Password</span>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus required />
        </label>
        {err && <p className="err">{err}</p>}
        <button className="btn primary" disabled={busy}>{busy ? 'Checking...' : 'Log in'}</button>
        <a className="help" href="/">Back to website</a>
      </form>
    </div>
  );
}

/* ---------------- Section editor ---------------- */
function fillSlugs(section, value) {
  if (!section.field.slugFrom || !Array.isArray(value)) return value;
  const used = new Set();
  return value.map((it) => {
    let s = slugify(it.slug || it[section.field.slugFrom] || 'item');
    let n = 2; const base = s;
    while (used.has(s)) s = `${base}-${n++}`;
    used.add(s);
    return { ...it, slug: s };
  });
}

function SectionEditor({ section, content, onSaved, toast }) {
  const [draft, setDraft] = useState(content[section.key]);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const h = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  async function save() {
    setBusy(true);
    try {
      const value = fillSlugs(section, draft);
      await api.save(section.key, value);
      setDraft(value); setDirty(false);
      onSaved(section.key, value);
      toast('Saved! Your website will show the change in about 1 minute.');
    } catch (e) { toast(e.message, true); }
    setBusy(false);
  }
  const label = busy ? 'Saving...' : dirty ? 'Save changes' : 'Saved';

  return (
    <div>
      <div className="page-title">
        <div><h1>{section.label}</h1>{section.help && <p>{section.help}</p>}</div>
        <button className="btn primary" onClick={save} disabled={busy || !dirty}>{label}</button>
      </div>
      <div className="editor">
        <Field def={section.field} value={draft} onChange={(v) => { setDraft(v); setDirty(true); }} />
      </div>
      <div className="sticky-save">
        <button className="btn primary" onClick={save} disabled={busy || !dirty}>{label}</button>
        {dirty && <span>You have unsaved changes</span>}
      </div>
    </div>
  );
}

/* ---------------- Connection status ---------------- */
function Connection() {
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api.status().then(setS).catch((e) => setErr(e.message)); }, []);
  const Row = ({ ok, label, hint }) => (
    <li className={ok ? 'done' : ''}><span>{ok ? '✓' : '✕'}</span><div><b>{label}</b>{!ok && hint && <small className="help">{hint}</small>}</div></li>
  );
  return (
    <div>
      <div className="page-title"><div><h1>Connection and setup</h1><p>How this admin panel talks to GitHub and Netlify.</p></div></div>
      {err && <div className="notice err">{err}</div>}
      {s && (
        <ul className="checklist">
          <Row ok label={`Connected to GitHub repository ${s.owner}/${s.repo} (branch ${s.branch})`} />
          <Row ok={s.canPush} label="Token can write to the repository" hint="Give the token the permission Contents: Read and write." />
          <Row ok={s.private} label="Repository is private (recommended)" hint="Make the repository private on GitHub, because the password hash is stored in it after you change your password." />
          <Row ok={s.passwordStoredInRepo} label="Password was changed inside the admin panel" hint="You are using the ADMIN_PASSWORD from Netlify. Change it from Account if you like." />
          <Row ok={s.netlifyApi} label="Enquiries can be read here" hint="Optional: add NETLIFY_API_TOKEN (and NETLIFY_SITE_ID) in Netlify environment variables." />
        </ul>
      )}
      <p className="help">Every time you press Save, the change is committed to GitHub. Netlify sees the commit and rebuilds your website, which takes about one minute.</p>
    </div>
  );
}

/* ---------------- Enquiries ---------------- */
function Enquiries() {
  const [d, setD] = useState(null);
  useEffect(() => { api.enquiries().then(setD).catch((e) => setD({ error: e.message, items: [] })); }, []);
  if (!d) return <p>Loading...</p>;
  return (
    <div>
      <div className="page-title"><div><h1>Enquiries</h1><p>Messages sent through the contact forms on your website.</p></div></div>
      {d.configured === false && <div className="notice">To see enquiries here, add <b>NETLIFY_API_TOKEN</b> in Netlify environment variables (User settings, Applications, Personal access tokens) and redeploy. You can always read them in the Netlify dashboard under <b>Forms</b>.</div>}
      {d.error && <div className="notice err">{d.error}</div>}
      <div className="enq">
        {d.items.map((s) => (
          <div key={s.id} className="enq-item">
            <div className="enq-top"><strong>{s.data?.name || 'Unknown'}</strong><span>{new Date(s.created_at).toLocaleString('en-IN')}</span></div>
            <p>{s.data?.phone && <a href={`tel:${s.data.phone}`}>{s.data.phone}</a>} {s.data?.email && <a href={`mailto:${s.data.email}`}>{s.data.email}</a>}</p>
            {s.data?.service && <p><b>Service:</b> {s.data.service}</p>}
            {s.data?.message && <p>{s.data.message}</p>}
          </div>
        ))}
        {d.configured && !d.error && d.items.length === 0 && <p className="empty">No enquiries yet.</p>}
      </div>
    </div>
  );
}

/* ---------------- Account ---------------- */
function Account({ toast }) {
  const [cur, setCur] = useState(''); const [nw, setNw] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true);
    try { await api.password(cur, nw); setCur(''); setNw(''); toast('Password changed. Use the new one next time you log in.'); } catch (ex) { toast(ex.message, true); }
    setBusy(false);
  }
  return (
    <div>
      <div className="page-title"><div><h1>Account</h1><p>Change your admin password.</p></div></div>
      <form className="editor" onSubmit={submit}>
        <fieldset className="group">
          <label className="field"><span className="label">Current password</span><input type="password" value={cur} onChange={(e) => setCur(e.target.value)} required /></label>
          <label className="field"><span className="label">New password (at least 8 characters)</span><input type="password" value={nw} onChange={(e) => setNw(e.target.value)} minLength={8} required /></label>
          <button className="btn primary" disabled={busy}>{busy ? 'Changing...' : 'Change password'}</button>
          <small className="help">If you ever forget the new password, delete the file <code>content/admin-auth.json</code> in your GitHub repository. The ADMIN_PASSWORD from Netlify will work again.</small>
        </fieldset>
      </form>
    </div>
  );
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ go }) {
  const steps = [
    ['settings', 'Update site settings: phone, WhatsApp, email and address'],
    ['about', 'Add the founder details on the About page'],
    ['services', 'Review your services and fees'],
    ['testimonials', 'Add real client testimonials'],
    ['account', 'Change your admin password'],
  ];
  return (
    <div>
      <div className="page-title"><div><h1>Welcome back</h1><p>Pick a page from the menu on the left, change what you need and press Save.</p></div></div>
      <div className="notice">Changes are saved straight to GitHub. Netlify then updates your live website in about <b>1 minute</b>. You can do this from any phone or computer.</div>
      <h2 className="h2">Things to do first</h2>
      <ul className="checklist">
        {steps.map(([to, text]) => <li key={to}><span>○</span><a href={`#${to}`} onClick={() => go(to)}>{text}</a></li>)}
      </ul>
    </div>
  );
}

/* ---------------- Shell ---------------- */
function Shell({ onLogout }) {
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');
  const [view, setView] = useState(location.hash.slice(1) || 'dashboard');
  const [toastMsg, setToastMsg] = useState(null);
  const [menu, setMenu] = useState(false);
  const [lastSave, setLastSave] = useState(null);

  const toast = useCallback((msg, bad) => { setToastMsg({ msg, bad }); setTimeout(() => setToastMsg(null), bad ? 7000 : 3500); }, []);
  const go = (v) => { setView(v); location.hash = v; setMenu(false); };
  useEffect(() => { api.content().then(setContent).catch((e) => setError(e.message)); }, []);

  if (error) return <div className="loading"><p className="err">{error}</p><button className="btn" onClick={onLogout}>Back to login</button></div>;
  if (!content) return <div className="loading">Loading your website content...</div>;
  const section = SECTIONS.find((s) => s.key === view);
  const groups = ['Website', 'Pages', 'Content'];
  const link = (key, text) => <a className={view === key ? 'on' : ''} href={`#${key}`} onClick={() => go(key)}>{text}</a>;

  return (
    <div className="shell">
      <aside className={`side ${menu ? 'open' : ''}`}>
        <div className="side-brand"><img src="/logo.png" alt="" /><div><strong>Disha Overseas</strong><small>Admin panel</small></div></div>
        <nav>
          {link('dashboard', 'Dashboard')}
          {groups.map((g) => (
            <div key={g}>
              <h4>{g}</h4>
              {SECTIONS.filter((s) => s.group === g).map((s) => <React.Fragment key={s.key}>{link(s.key, s.label)}</React.Fragment>)}
            </div>
          ))}
          <h4>Manage</h4>
          {link('enquiries', 'Enquiries')}
          {link('connection', 'Connection')}
          {link('account', 'Account')}
          <a href="/" target="_blank" rel="noreferrer">Open live website</a>
          <a href="#logout" onClick={onLogout}>Log out</a>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="burger" onClick={() => setMenu(!menu)} aria-label="Menu">☰</button>
          <div className={`pill ${lastSave ? 'warn' : 'good'}`}>{lastSave ? `Last saved ${lastSave}. Live in about 1 minute.` : 'Connected to GitHub'}</div>
          <span className="spacer" />
          <a className="btn" href="/" target="_blank" rel="noreferrer">View website</a>
        </header>
        <div className="content">
          {view === 'dashboard' && <Dashboard go={go} />}
          {section && <SectionEditor key={section.key} section={section} content={content} toast={toast}
            onSaved={(k, v) => { setContent({ ...content, [k]: v }); setLastSave(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })); }} />}
          {view === 'connection' && <Connection />}
          {view === 'enquiries' && <Enquiries />}
          {view === 'account' && <Account toast={toast} />}
        </div>
      </div>
      {toastMsg && <div className={`toast ${toastMsg.bad ? 'bad' : ''}`} role="status">{toastMsg.msg}</div>}
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(hasToken());
  useEffect(() => { const h = () => setAuthed(false); window.addEventListener('disha-logout', h); return () => window.removeEventListener('disha-logout', h); }, []);
  if (!authed) return <Login onDone={() => setAuthed(true)} />;
  return <Shell onLogout={() => { setToken(''); setAuthed(false); }} />;
}
