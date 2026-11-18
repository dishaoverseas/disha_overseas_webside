import React from 'react';
import { useContent } from '../content.jsx';
import { CheckCircle2 } from '../icons.jsx';
import { Btn, SectionHead } from './Common.jsx';
import { Reveal } from './Motion.jsx';
import { Flag } from '../pages/Destinations.jsx';

// Country by country sections with a photo and a short description (edited in Admin > Country showcase)
export default function Showcase() {
  const { showcase: sc } = useContent();
  const items = (sc?.items || []).filter((x) => x && x.title);
  if (!items.length) return null;
  return (
    <section className="section showcase" id="countries">
      <div className="container">
        <Reveal><SectionHead title={sc.title} subtitle={sc.subtitle} center /></Reveal>
        <div className="sc-list">
          {items.map((it, i) => (
            <article key={it.title + i} className={`sc-row ${i % 2 ? 'flip' : ''}`}>
              <Reveal from={i % 2 ? 'right' : 'left'} className="sc-media">
                {it.image ? <img src={it.image} alt={it.title} loading="lazy" /> : (
                  <div className="sc-flagpanel" role="img" aria-label={it.title}>
                    {it.flag && <Flag code={it.flag} name={it.title} className="sc-bigflag" />}
                  </div>
                )}
                <span className="sc-pill">{it.flag && <Flag code={it.flag} name="" className="sc-miniflag" />} {it.title}</span>
              </Reveal>
              <Reveal from={i % 2 ? 'left' : 'right'} delay={0.1} className="sc-body">
                <h3>{it.title}</h3>
                {it.text && <p>{it.text}</p>}
                {it.points?.length > 0 && (
                  <ul className="ticks">
                    {it.points.map((p, k) => <li key={k} style={{ '--k': k }}><CheckCircle2 size={18} aria-hidden="true" /> {p}</li>)}
                  </ul>
                )}
                <Btn to={it.buttonLink || '/contact'} arrow>{it.buttonLabel || 'Enquire now'}</Btn>
              </Reveal>
            </article>
          ))}
        </div>
        {sc.moreLabel && <div className="center-btn"><Btn to="/destinations" variant="outline">{sc.moreLabel}</Btn></div>}
      </div>
    </section>
  );
}