import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../content.jsx';
import { Icon, CheckCircle2, Star, Quote, ArrowRight } from '../icons.jsx';
import { Btn, Img, SectionHead, Faq, CtaBand } from '../components/Common.jsx';
import { useSeo } from '../utils.js';

function RouteArt({ from, to, stampTitle, stampText }) {
  return (
    <div className="route-art" aria-hidden="true">
      <svg viewBox="0 0 460 420" role="img">
        <g fill="none" stroke="rgba(255,255,255,.12)">
          <circle cx="230" cy="210" r="70" />
          <circle cx="230" cy="210" r="120" />
          <circle cx="230" cy="210" r="170" />
          <circle cx="230" cy="210" r="220" />
          <path d="M230 -10V430M10 210H450" />
        </g>
        <path id="flight" d="M70 330 C 110 130 300 70 390 120" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="3 9" strokeLinecap="round" />
        <circle cx="70" cy="330" r="9" fill="#fff" />
        <circle cx="390" cy="120" r="9" fill="var(--accent)" stroke="#fff" strokeWidth="3" />
        <text x="70" y="362" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="600">{from}</text>
        <text x="390" y="100" textAnchor="middle" fill="#fff" fontSize="17" fontWeight="600">{to}</text>
        <g transform="translate(235 118) rotate(18)">
          <path d="M-14 6 L14 -2 L-14 -10 L-8 -2Z" fill="#fff" />
        </g>
      </svg>
      <div className="stamp">
        <strong>{stampTitle}</strong>
        <span>{stampText}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const { home: h, services, testimonials, faqs, settings } = useContent();
  useSeo(null);

  return (
    <>
      <section className="hero">
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
          <div className="hero-visual">
            {h.hero.image ? (
              <div className="hero-photo">
                <img src={h.hero.image} alt="" />
                <div className="stamp"><strong>{h.hero.stampTitle}</strong><span>{h.hero.stampText}</span></div>
              </div>
            ) : (
              <RouteArt from={h.hero.routeFrom} to={h.hero.routeTo} stampTitle={h.hero.stampTitle} stampText={h.hero.stampText} />
            )}
          </div>
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
