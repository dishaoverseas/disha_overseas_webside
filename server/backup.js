// Keeps a safety copy of your content and uploaded images on GitHub, in a SEPARATE branch (default: data-backup).
// Why a separate branch: the main branch triggers hosting redeploys, a backup branch does not.
// If the hosting ever wipes the data folder, the server restores everything from this branch on the next start.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export function createBackup({ contentFile, uploadsDir, log = console }) {
  const cfg = () => ({
    token: process.env.GITHUB_TOKEN || '', owner: process.env.GITHUB_OWNER || '', repo: process.env.GITHUB_REPO || '',
    branch: process.env.BACKUP_BRANCH || 'data-backup',
  });
  const enabled = () => { const c = cfg(); return !!(c.token && c.owner && c.repo); };
  const state = { last: null, error: null, running: false };
  let timer = null;

  async function gh(p, opt = {}) {
    const c = cfg();
    const res = await fetch(`https://api.github.com/repos/${c.owner}/${c.repo}${p}`, {
      ...opt,
      headers: { Authorization: `Bearer ${c.token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'disha-overseas-server', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(`GitHub ${res.status}: ${data.message || ''}`); e.status = res.status; throw e; }
    return data;
  }
  async function branchHead() {
    try { return (await gh(`/git/ref/heads/${cfg().branch}`)).object.sha; } catch (e) { if (e.status === 404) return null; throw e; }
  }
  async function ensureBranch() {
    const head = await branchHead();
    if (head) return head;
    const repo = await gh('');
    const base = await gh(`/git/ref/heads/${repo.default_branch}`);
    await gh('/git/refs', { method: 'POST', body: JSON.stringify({ ref: `refs/heads/${cfg().branch}`, sha: base.object.sha }) });
    return base.object.sha;
  }
  const blobSha = (buf) => crypto.createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');
  const listUploads = () => (fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).filter((f) => !f.startsWith('.')) : []);

  async function run() {
    if (!enabled() || state.running || !fs.existsSync(contentFile)) return;
    state.running = true;
    try {
      const head = await ensureBranch();
      const commit = await gh(`/git/commits/${head}`);
      const tree = await gh(`/git/trees/${commit.tree.sha}?recursive=1`);
      const remote = new Map(tree.tree.filter((t) => t.type === 'blob').map((t) => [t.path, t.sha]));
      const files = [{ path: 'backup/content.json', buf: fs.readFileSync(contentFile) }];
      for (const f of listUploads()) if (!remote.has(`backup/uploads/${f}`)) files.push({ path: `backup/uploads/${f}`, buf: fs.readFileSync(path.join(uploadsDir, f)) });
      const changed = files.filter((f) => remote.get(f.path) !== blobSha(f.buf));
      if (changed.length) {
        const entries = [];
        for (const f of changed) {
          const b = await gh('/git/blobs', { method: 'POST', body: JSON.stringify({ content: f.buf.toString('base64'), encoding: 'base64' }) });
          entries.push({ path: f.path, mode: '100644', type: 'blob', sha: b.sha });
        }
        const nt = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: commit.tree.sha, tree: entries }) });
        const nc = await gh('/git/commits', { method: 'POST', body: JSON.stringify({ message: `Backup from server ${new Date().toISOString()}`, tree: nt.sha, parents: [head] }) });
        await gh(`/git/refs/heads/${cfg().branch}`, { method: 'PATCH', body: JSON.stringify({ sha: nc.sha }) });
      }
      state.last = new Date().toISOString(); state.error = null;
    } catch (e) { state.error = e.message; log.error('Backup failed:', e.message); }
    finally { state.running = false; }
  }

  // Waits a little after the last change, then pushes one backup
  function schedule(ms = 30000) { if (!enabled()) return; clearTimeout(timer); timer = setTimeout(run, ms); }

  // Brings back only what is MISSING locally (never overwrites your current files)
  async function restore() {
    if (!enabled()) return false;
    try {
      const head = await branchHead();
      if (!head) return false;
      const commit = await gh(`/git/commits/${head}`);
      const tree = await gh(`/git/trees/${commit.tree.sha}?recursive=1`);
      let restored = false;
      for (const t of tree.tree) {
        if (t.type !== 'blob' || !t.path.startsWith('backup/')) continue;
        const rel = t.path.slice('backup/'.length);
        let dest = null;
        if (rel === 'content.json') dest = contentFile;
        else if (rel.startsWith('uploads/')) dest = path.join(uploadsDir, path.basename(rel));
        if (!dest || fs.existsSync(dest)) continue;
        const blob = await gh(`/git/blobs/${t.sha}`);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, Buffer.from(blob.content, 'base64'));
        restored = true;
      }
      return restored;
    } catch (e) { log.error('Restore failed:', e.message); return false; }
  }

  return { enabled, run, schedule, restore, state };
}