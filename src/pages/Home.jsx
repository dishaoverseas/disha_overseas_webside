import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DestCard, destLink } from './Destinations.jsx';
import { useContent } from '../content.jsx';
import { Icon, CheckCircle2, Star, Quote, ArrowRight } from '../icons.jsx';
import { Btn, Img, SectionHead, Faq, CtaBand } from '../components/Common.jsx';
import { useSeo } from '../utils.js';

function VisaFinder() {
  const { destinations, home: h } = useContent();
  const nav = useNavigate();
  const [slug, setSlug] = useState('');
  const go = (e) => {
    e.preventDefault();
    const d = destinations.find((x) => x.slug === slug);
    nav(d ? destLink(d) : '/destinations');
  };
  return (
    <form className="finder" onSubmit={go}>
      <h3>{h.hero.finderTitle}</h3>
      <p>{h.hero.finderText}</p>
      <label>Where do you want to go?
        <select value={slug} onChange={(e) => setSlug(e.target.value)}>
          <option value="">Choose a country</option>
          {destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
      </label>
      <button className="btn btn-primary">Check how we can help</button>
      <small>Country not listed? <Link to="/contact">Ask us</Link>, we may still be able to help.</small>
    </form>
  );
}

export default function Home() {
  const { home: h, services, testimonials, faqs, destinations } = useContent();
  useSeo(null);

  return (
    <>
      <section className="hero" style={h.hero.image ? { backgroundImage: `linear-gradient(160deg, rgba(6,26,66,.88), rgba(10,42,102,.8)), url(${h.hero.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="badge">{h.hero.badge}</span>
            <h1>{h.hero.title}</h1>
            <p className="lead">{h.hero.subtitle}</p>
            <div className="hero-actions">
              <Btn to={h.hero.primaryBtn.link} arrow>{h.hero.primaryBtn.label}</Btn>
              <Btn to={h.hero.secondaryBtn.link} variant="ghost">{h.hero.secondaryBtn.label}</Btn>
            </div>
            <ul className="hero-points">
              {h.hero.points.map((p, i) => <li key={i}><CheckCircle2 size={18} aria-hidden="true" /> {p}</li>)}
            </ul>
          </div>
          <div className="hero-visual"><VisaFinder /></div>
        </div>
      </section>

      <section className="stats">
        <div className="container stats-grid">
          {h.stats.map((s, i) => (
            <div key={i} className="stat"><strong>{s.value}</strong><span>{s.label}</span></div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead title={h.destinationsIntro.title} subtitle={h.destinationsIntro.subtitle} />
          <div className="grid grid-3">
            {destinations.slice(0, 8).map((d) => <DestCard key={d.slug} d={d} />)}
          </div>
          <div className="center-btn"><Btn to="/destinations" variant="outline">See all destinations</Btn></div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <SectionHead title={h.servicesIntro.title} subtitle={h.servicesIntro.subtitle} />
          <div className="grid grid-3">
            {services.slice(0, 6).map((s) => (
              <Link to={`/services/${s.slug}`} key={s.slug} className="card service-card">
                <span className="icon-box"><Icon name={s.icon} /></span>
                <h3>{s.title}</h3>
                <p>{s.short}</p>
                <span className="more">Learn more <ArrowRight size={16} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
          <div className="center-btn"><Btn to="/services" variant="outline">View all services</Btn></div>
        </div>
      </section>

      <section className="russia-banner">
        <div className="container russia-grid">
          <div>
            <h2>{h.russiaBanner.title}</h2>
            <p>{h.russiaBanner.text}</p>
            <Btn to={h.russiaBanner.button.link} variant="light" arrow>{h.russiaBanner.button.label}</Btn>
          </div>
          {h.russiaBanner.image ? <Img src={h.russiaBanner.image} alt="Russia" className="russia-img" /> : <div className="russia-mark" aria-hidden="true"><span>RU</span></div>}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead title={h.whyUs.title} subtitle={h.whyUs.subtitle} />
          <div className="grid grid-3">
            {h.whyUs.items.map((it, i) => (
              <div key={i} className="feature">
                <span className="icon-box icon-accent"><Icon name={it.icon} /></span>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container">
          <SectionHead title={h.process.title} subtitle={h.process.subtitle} />
          <ol className="steps">
            {h.process.steps.map((s, i) => (
              <li key={i}>
                <span className="step-n">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHead title={h.testimonialsIntro.title} subtitle={h.testimonialsIntro.subtitle} />
            <div className="grid grid-3">
              {testimonials.map((t, i) => (
                <figure key={i} className="card testi">
                  <Quote size={28} className="q" aria-hidden="true" />
                  <div className="stars" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: Number(t.rating) || 5 }).map((_, k) => <Star key={k} size={16} fill="currentColor" />)}
                  </div>
                  <blockquote>{t.text}</blockquote>
                  <figcaption><strong>{t.name}</strong><span>{[t.location, t.visa].filter(Boolean).join(', ')}</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section-tint">
        <div className="container narrow">
          <SectionHead title={h.faqIntro.title} subtitle={h.faqIntro.subtitle} center />
          <Faq items={faqs.slice(0, 5)} />
          <div className="center-btn"><Btn to="/faq" variant="outline">See all questions</Btn></div>
        </div>
      </section>

      <CtaBand data={h.cta} />
    </>
  );
}