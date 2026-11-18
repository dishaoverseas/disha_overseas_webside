import React, { useState } from 'react';
import { useContent } from '../content.jsx';
import { Star, Quote, Pause, Play } from '../icons.jsx';
import { SectionHead } from './Common.jsx';
import { Reveal } from './Motion.jsx';

const SOURCE = { google: 'Google review', facebook: 'Facebook review', whatsapp: 'WhatsApp feedback', direct: 'Client feedback' };

function Card({ t }) {
  const n = Math.min(5, Math.max(1, Number(t.rating) || 5));
  const label = SOURCE[String(t.source || '').toLowerCase()] || t.source || '';
  const sub = [t.location, t.visa].filter(Boolean).join(', ');
  return (
    <figure className="rv-card">
      <Quote size={26} className="rv-q" aria-hidden="true" />
      <div className="stars" aria-label={`${n} out of 5 stars`}>{Array.from({ length: n }).map((_, k) => <Star key={k} size={16} fill="currentColor" />)}</div>
      <blockquote>{t.text}</blockquote>
      <figcaption>
        <span className="rv-avatar">{t.photo ? <img src={t.photo} alt="" loading="lazy" /> : <b>{(t.name || '?').trim().slice(0, 1).toUpperCase()}</b>}</span>
        <span className="rv-who"><strong>{t.name}</strong><small>{sub}{sub && label ? ' · ' : ''}{t.link ? <a href={t.link} target="_blank" rel="noreferrer">{label}</a> : label}</small></span>
      </figcaption>
    </figure>
  );
}

// Reviews that glide across the page. Add real client reviews in Admin > Testimonials.
export default function Reviews() {
  const { testimonials = [], home, reviewsBar: rb = {} } = useContent();
  const [paused, setPaused] = useState(false);
  const list = testimonials.filter((t) => t && t.text);
  if (!list.length) return null;
  const set = Array.from({ length: Math.max(1, Math.ceil(7 / list.length)) }).flatMap(() => list);
  const intro = home?.testimonialsIntro || {};
  const showBar = rb.show !== 'no' && rb.score && rb.count;

  return (
    <section className="section section-tint reviews" id="reviews">
      <div className="container">
        <Reveal>
          {rb.eyebrow && <span className="eyebrow">{rb.eyebrow}</span>}
          <SectionHead title={intro.title || 'What our clients say'} subtitle={intro.subtitle} center />
        </Reveal>
      </div>
      <div className="rv-wrap" onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <div className={`rv-track ${paused ? 'paused' : ''}`} style={{ '--rv-dur': `${Math.max(36, set.length * 8)}s` }}>
          {[0, 1].map((r) => set.map((t, i) => (
            <div key={`${r}-${i}`} className="rv-item" aria-hidden={r ? 'true' : undefined}><Card t={t} /></div>
          )))}
        </div>
      </div>
      <div className="container rv-foot">
        <button type="button" className="rv-pause" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? <><Play size={15} /> Play</> : <><Pause size={15} /> Pause</>}
        </button>
        {showBar && (
          <a className="rv-bar" href={rb.link || undefined} target="_blank" rel="noreferrer">
            <span className="stars" aria-hidden="true">{Array.from({ length: 5 }).map((_, k) => <Star key={k} size={15} fill="currentColor" />)}</span>
            <b>{rb.score}</b> · {rb.source || 'Google'} · {rb.count} reviews
          </a>
        )}
      </div>
    </section>
  );
}