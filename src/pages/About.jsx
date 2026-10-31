import React from 'react';
import { useContent } from '../content.jsx';
import { Icon, CheckCircle2, Quote } from '../icons.jsx';
import { PageHero, RichText, Img, SectionHead, CtaBand } from '../components/Common.jsx';
import { useSeo } from '../utils.js';

export default function About() {
  const { about: a, home } = useContent();
  useSeo('About Us', a.hero.subtitle);
  const c = a.company, f = a.founder;
  return (
    <>
      <PageHero title={a.hero.title} subtitle={a.hero.subtitle} />

      <section className="section">
        <div className="container split">
          <div>
            <h2>{c.title}</h2>
            <RichText text={c.text} />
          </div>
          <Img src={c.image} alt="Disha Overseas office" className="split-img" icon="Compass" />
        </div>
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

      <CtaBand data={home.cta} />
    </>
  );
}
