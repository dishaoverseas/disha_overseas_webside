import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../content.jsx';
import { X, Search, ChevronRight, MessageCircle } from '../icons.jsx';
import { waLink, isExternal, track } from '../utils.js';

// Chat style helper: shows suggestions, and a click takes the visitor to that page or section.
// Everything (name, greeting, suggestions, where each one goes) is edited in Admin > Assistant.
export default function Assistant() {
  const { assistant: a, settings } = useContent();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [typing, setTyping] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  const items = a?.items || [];
  const enabled = a && a.enabled !== 'no' && items.length > 0;

  // friendly greeting bubble pops up once per visit
  useEffect(() => {
    if (!enabled || sessionStorage.getItem('assistant-seen')) return undefined;
    const t = setTimeout(() => setTeaser(true), 6000);
    const h = setTimeout(() => setTeaser(false), 15000);
    return () => { clearTimeout(t); clearTimeout(h); };
  }, [enabled]);

  useEffect(() => {
    if (!open) return undefined;
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 750);
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [open]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((i) => `${i.label} ${i.keywords || ''}`.toLowerCase().includes(t));
  }, [items, q]);

  if (!enabled) return null;
  const initials = (a.name || 'D').trim().slice(0, 1).toUpperCase();
  const Avatar = () => (
    <span className="as-avatar big">
      {a.avatar ? <img src={a.avatar} alt="" /> : <span>{initials}</span>}
      <i className="as-online" />
    </span>
  );

  function pick(item) {
    setOpen(false); setQ(''); sessionStorage.setItem('assistant-seen', '1');
    const t = String(item.target || '').trim();
    if (t === 'whatsapp') { track('Contact'); window.open(waLink(settings.whatsapp), '_blank'); return; }
    if (isExternal(t)) { window.open(t, '_blank'); return; }
    nav(t || '/');
  }
  const toggle = () => { setOpen((o) => !o); setTeaser(false); sessionStorage.setItem('assistant-seen', '1'); };

  return (
    <div className="assistant">
      {open && (
        <section className="as-panel" role="dialog" aria-label={`${a.name} visa assistant`}>
          <header>
            <Avatar />
            <div><strong>{a.name}</strong><small>{a.role} <em>Online</em></small></div>
            <button type="button" className="as-x" onClick={() => setOpen(false)} aria-label="Close"><X size={20} /></button>
          </header>
          <div className="as-body">
            <div className="as-msg">
              {typing ? <span className="as-dots"><i /><i /><i /></span> : a.greeting}
            </div>
            {!typing && (
              <>
                <label className="as-search">
                  <Search size={16} aria-hidden="true" />
                  <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder={a.placeholder || 'Type what you need'} aria-label="Search suggestions" />
                </label>
                <ul className="as-list">
                  {shown.map((it, i) => (
                    <li key={it.label + i} style={{ '--i': i }}>
                      <button type="button" onClick={() => pick(it)}>{it.label}<ChevronRight size={16} aria-hidden="true" /></button>
                    </li>
                  ))}
                </ul>
                {shown.length === 0 && (
                  <button type="button" className="as-wa" onClick={() => pick({ target: 'whatsapp' })}><MessageCircle size={16} /> {a.fallback || 'Chat with our team on WhatsApp'}</button>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {teaser && !open && (
        <button type="button" className="as-teaser" onClick={toggle}>
          <span>{a.greeting}</span>
          <i role="button" tabIndex={0} aria-label="Dismiss" onClick={(e) => { e.stopPropagation(); setTeaser(false); sessionStorage.setItem('assistant-seen', '1'); }}>&times;</i>
        </button>
      )}

      <button type="button" className={`as-launch ${open ? 'is-open' : ''}`} onClick={toggle} aria-label={open ? 'Close assistant' : `Ask ${a.name}`} aria-expanded={open}>
        {open ? <X size={26} /> : <Avatar />}
      </button>
    </div>
  );
}