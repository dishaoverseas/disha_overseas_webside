import React, { useEffect, useState } from 'react';
import { useContent } from '../content.jsx';
import { Icon, CheckCircle2, Quote } from '../icons.jsx';
import { PageHero, RichText, Img, SectionHead, CtaBand } from '../components/Common.jsx';
import { useSeo } from '../utils.js';

export default function About() {
  const { about: a, home } = useContent();
  useSeo('About Us', a.hero.subtitle);
  const c = a.company, f = a.founder;
  // main photo + any extra photos added in the admin panel
  const entries = [{ src: c.image, caption: '' }, ...(c.gallery || []).map((g) => ({ src: g?.image, caption: g?.caption || '' }))].filter((e) => e.src);
  const photos = entries.map((e) => e.src);
  const captions = entries.map((e) => e.caption);
  const [open, setOpen] = useState(-1);
  useEffect(() => {
    if (open < 0) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(-1); if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % photos.length); if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + photos.length) % photos.length); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, photos.length]);
  return (
    <>
      <PageHero title={a.hero.title} subtitle={a.hero.subtitle} />

      <section className="section">
        <div className="container split">
          <div>
            <h2>{c.title}</h2>
            <RichText text={c.text} />
          </div>
          <Img src={photos[0]} alt="Disha Overseas" className="split-img" icon="Compass" />
        </div>
        {photos.length > 1 && (
          <div className="container">
            <h3 className="gallery-title">{c.galleryTitle || 'Our office and team'}</h3>
            <div className="gallery">
              {photos.slice(1).map((src, i) => (
                <button type="button" key={src + i} className="gallery-item" onClick={() => setOpen(i + 1)} aria-label="Enlarge photo">
                  <img src={src} alt={captions[i + 1] || 'Disha Overseas photo'} loading="lazy" />
                  {captions[i + 1] && <span>{captions[i + 1]}</span>}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="container grid grid-2 mv">
          <div className="card"><span className="icon-box"><Icon name="Target" /></span><h3>Our mission</h3><p>{c.mission}</p></div>
          <div className="card"><span className="icon-box icon-accent"><Icon name="Eye" /></span><h3>Our vision</h3><p>{c.vision}</p></div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <SectionHead title="What we stand for" center />
          <div className="grid grid-4">
            {c.values.map((v, i) => (
              <div key={i} className="feature center-text">
                <span className="icon-box"><Icon name={v.icon} /></span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container founder">
          <Img src={f.photo} alt={f.name} className="founder-photo" icon="Users" />
          <div>
            <h2>{f.title}</h2>
            <h3 className="founder-name">{f.name}</h3>
            <p className="founder-role">{f.role}</p>
            <RichText text={f.bio} />
            {f.quote && <blockquote className="pull"><Quote size={22} aria-hidden="true" />{f.quote}</blockquote>}
            {f.highlights?.length > 0 && (
              <ul className="ticks">
                {f.highlights.map((h, i) => <li key={i}><CheckCircle2 size={18} aria-hidden="true" /> {h}</li>)}
              </ul>
            )}
          </div>
        </div>
      </section>

      {open >= 0 && photos[open] && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setOpen(-1)}>
          <button type="button" className="lb-close" aria-label="Close" onClick={() => setOpen(-1)}>&times;</button>
          {photos.length > 1 && <button type="button" className="lb-nav lb-prev" aria-label="Previous" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + photos.length) % photos.length); }}>&#8249;</button>}
          <img src={photos[open]} alt={captions[open] || ''} onClick={(e) => e.stopPropagation()} />
          {photos.length > 1 && <button type="button" className="lb-nav lb-next" aria-label="Next" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % photos.length); }}>&#8250;</button>}
        </div>
      )}

      <CtaBand data={home.cta} />
    </>
  );
}