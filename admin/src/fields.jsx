import React, { useRef, useState } from 'react';
import { api, previews } from './api.js';
import { ICON_NAMES, blankFor } from './schema.js';

const Help = ({ text }) => (text ? <small className="help">{text}</small> : null);

function resizeToDataUrl(file, max = 1600) {
  return new Promise((resolve, reject) => {
    if (/svg|gif/.test(file.type)) {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
      return;
    }
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      const scale = Math.min(1, max / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * scale);
      c.height = Math.round(im.height * scale);
      const ctx = c.getContext('2d');
      ctx.drawImage(im, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      // PNG keeps transparency (logos); photos become compact WebP
      resolve(file.type === 'image/png' && file.size < 600 * 1024 ? c.toDataURL('image/png') : c.toDataURL('image/webp', 0.85));
    };
    im.onerror = () => reject(new Error('Could not read this image'));
    im.src = url;
  });
}

function ImageField({ def, value, onChange }) {
  const input = useRef();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr('');
    try {
      const data = await resizeToDataUrl(file);
      const { path } = await api.upload(file.name, data);
      onChange(path);
    } catch (ex) { setErr(ex.message); }
    setBusy(false);
    e.target.value = '';
  }

  return (
    <div className="img-field">
      <div className="img-preview">{value ? <img src={previews.get(value) || value} alt="" /> : <span>No image</span>}</div>
      <div className="img-actions">
        <input ref={input} type="file" accept="image/*" hidden onChange={pick} />
        <button type="button" className="btn small" onClick={() => input.current.click()} disabled={busy}>{busy ? 'Uploading...' : value ? 'Replace image' : 'Upload image'}</button>
        {value && <button type="button" className="btn small ghost" onClick={() => onChange('')}>Remove</button>}
        <input className="path" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="or paste an image address" />
        {err && <small className="err">{err}</small>}
      </div>
    </div>
  );
}

function StringsField({ def, value = [], onChange }) {
  const set = (i, v) => onChange(value.map((x, k) => (k === i ? v : x)));
  return (
    <div className="strings">
      {value.map((s, i) => (
        <div key={i} className="string-row">
          <input value={s} onChange={(e) => set(i, e.target.value)} />
          <button type="button" className="icon-btn" title="Move up" disabled={i === 0} onClick={() => { const v = [...value]; [v[i - 1], v[i]] = [v[i], v[i - 1]]; onChange(v); }}>↑</button>
          <button type="button" className="icon-btn" title="Move down" disabled={i === value.length - 1} onClick={() => { const v = [...value]; [v[i + 1], v[i]] = [v[i], v[i + 1]]; onChange(v); }}>↓</button>
          <button type="button" className="icon-btn danger" title="Delete" onClick={() => onChange(value.filter((_, k) => k !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="btn small" onClick={() => onChange([...value, ''])}>+ Add</button>
    </div>
  );
}

function ListField({ def, value = [], onChange }) {
  const [open, setOpen] = useState(() => new Set());
  const toggle = (i) => setOpen((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  const move = (i, d) => { const v = [...value]; const j = i + d; if (j < 0 || j >= v.length) return; [v[i], v[j]] = [v[j], v[i]]; onChange(v); setOpen(new Set()); };
  const remove = (i) => { if (confirm('Delete this item?')) { onChange(value.filter((_, k) => k !== i)); setOpen(new Set()); } };
  const title = (it, i) => (def.itemTitle && it[def.itemTitle]) || `Item ${i + 1}`;

  return (
    <div className="list">
      {value.length === 0 && <p className="empty">Nothing here yet.</p>}
      {value.map((it, i) => (
        <div key={i} className={`list-item ${open.has(i) ? 'open' : ''}`}>
          <div className="list-head" onClick={() => toggle(i)}>
            <span className="chev">{open.has(i) ? '▾' : '▸'}</span>
            <strong>{String(title(it, i)).slice(0, 80)}</strong>
            <span className="spacer" />
            <button type="button" className="icon-btn" title="Move up" onClick={(e) => { e.stopPropagation(); move(i, -1); }}>↑</button>
            <button type="button" className="icon-btn" title="Move down" onClick={(e) => { e.stopPropagation(); move(i, 1); }}>↓</button>
            <button type="button" className="icon-btn danger" title="Delete" onClick={(e) => { e.stopPropagation(); remove(i); }}>✕</button>
          </div>
          {open.has(i) && (
            <div className="list-body">
              {def.fields.map((f) => (
                <Field key={f.key} def={f} value={it[f.key]} onChange={(v) => onChange(value.map((x, k) => (k === i ? { ...x, [f.key]: v } : x)))} />
              ))}
            </div>
          )}
        </div>
      ))}
      <button type="button" className="btn small primary" onClick={() => { onChange([...value, blankFor(def.fields)]); setOpen(new Set([value.length])); }}>+ Add new</button>
    </div>
  );
}

export function Field({ def, value, onChange }) {
  const label = def.label && (
    <span className="label">{def.label}</span>
  );
  switch (def.type) {
    case 'text':
      return <label className="field">{label}<input value={value ?? ''} placeholder={def.placeholder} onChange={(e) => onChange(e.target.value)} /><Help text={def.help} /></label>;
    case 'number':
      return <label className="field">{label}<input type="number" min="1" max="5" value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} /></label>;
    case 'date':
      return <label className="field">{label}<input type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} /></label>;
    case 'textarea':
      return <label className="field">{label}<textarea rows={def.rows || 4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} /><Help text={def.help} /></label>;
    case 'color':
      return (
        <label className="field">{label}
          <span className="color-row"><input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} /><input value={value ?? ''} onChange={(e) => onChange(e.target.value)} /></span>
        </label>
      );
    case 'icon':
      return (
        <label className="field">{label}
          <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
            {ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      );
    case 'select':
      return (
        <label className="field">{label}
          <select value={value || def.options[0][0]} onChange={(e) => onChange(e.target.value)}>
            {def.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      );
    case 'image':
      return <div className="field">{label}<ImageField def={def} value={value} onChange={onChange} /></div>;
    case 'strings':
      return <div className="field">{label}<StringsField def={def} value={value || []} onChange={onChange} /></div>;
    case 'list':
      return <div className="field">{label}<ListField def={def} value={value || []} onChange={onChange} /></div>;
    case 'object': {
      const v = value || {};
      return (
        <fieldset className={`group ${def.inline ? 'inline' : ''}`}>
          {def.label && <legend>{def.label}</legend>}
          {def.fields.map((f) => <Field key={f.key} def={f} value={v[f.key]} onChange={(nv) => onChange({ ...v, [f.key]: nv })} />)}
        </fieldset>
      );
    }
    default:
      return null;
  }
}