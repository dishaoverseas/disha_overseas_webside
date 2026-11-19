import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../content.jsx';
import { X, Search, ChevronRight, MessageCircle } from '../icons.jsx';
import { waLink, isExternal, track } from '../utils.js';

// A friendly lady assistant with a headset (used when no photo is set in Admin > Assistant)
const AssistantFace = () => (
  <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="av-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e3edff" /><stop offset="1" stopColor="#c9dcff" /></linearGradient>
    </defs>
    <circle cx="32" cy="32" r="32" fill="url(#av-bg)" />
    <path d="M18.5 27 C17 14 25 8.5 32 8.5 C39 8.5 47 14 45.5 27 C48 38 47 48 51 59 L13 59 C17 48 16 38 18.5 27 Z" fill="#2a1a16" />
    <path d="M6 66 C8 53 19 47.5 32 47.5 C45 47.5 56 53 58 66 Z" fill="#0a2a66" />
    <path d="M27 40 L37 40 L37 47.5 C35 50.5 29 50.5 27 47.5 Z" fill="#eec3a6" />
    <path d="M25 47.5 L32 59 L39 47.5 C36 51 28 51 25 47.5 Z" fill="#fff" />
    <path d="M29.5 49.6 L32 54 L34.5 49.6 Z" fill="#d6202f" />
    <ellipse cx="32" cy="28" rx="11" ry="12.5" fill="#f8d4ba" />
    <path d="M20.5 25.5 C20 15 27 11.3 32 11.3 C38 11.3 44.5 15 43.5 25.5 C41 19.5 36 17.4 31 17.9 C26.5 18.4 22.5 21 20.5 25.5 Z" fill="#2a1a16" />
    <path d="M26.4 24.8 Q28.4 23.5 30.6 24.5 M33.4 24.5 Q35.6 23.5 37.6 24.8" stroke="#2a1a16" strokeWidth="1" strokeLinecap="round" fill="none" />
    <ellipse cx="28.5" cy="28" rx="1.2" ry="1.45" fill="#2a1a16" />
    <ellipse cx="35.5" cy="28" rx="1.2" ry="1.45" fill="#2a1a16" />
    <path d="M32 29.6 Q31.1 32.2 32.5 32.5" stroke="#d9a07f" strokeWidth=".9" strokeLinecap="round" fill="none" />
    <circle cx="25.4" cy="31.8" r="2.3" fill="#ff8f9a" opacity=".35" />
    <circle cx="38.6" cy="31.8" r="2.3" fill="#ff8f9a" opacity=".35" />
    <path d="M28.4 34.2 Q32 37.6 35.6 34.2" stroke="#c4373f" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <path d="M19.9 28 C19 11 45 11 44.1 28" stroke="#9fb0d3" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <rect x="17.4" y="25.4" width="4.4" height="8.4" rx="2.1" fill="#d6202f" />
    <rect x="42.2" y="25.4" width="4.4" height="8.4" rx="2.1" fill="#d6202f" />
    <path d="M44.4 32.6 C46 39 41.5 41.6 36.8 40" stroke="#9fb0d3" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <circle cx="36" cy="40" r="1.8" fill="#d6202f" />
  </svg>
);

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
  const Avatar = () => (
    <span className="as-avatar big face">
      {a.avatar ? <img src={a.avatar} alt="" /> : <AssistantFace />}
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