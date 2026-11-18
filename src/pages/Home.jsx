import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { destLink, Flag } from './Destinations.jsx';
import { StepArt } from '../components/Illustrations.jsx';
import HeroGlobe from '../components/HeroGlobe.jsx';
import Ticker from '../components/Ticker.jsx';
import Showcase from '../components/Showcase.jsx';
import Reviews from '../components/Reviews.jsx';
import { Reveal } from '../components/Motion.jsx';
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
    <form className="finder finder-wide" onSubmit={go}>
      <div className="finder-text">
        <h3>{h.hero.finderTitle}</h3>
        <p>{h.hero.finderText}</p>
      </div>
      <label>Where do you want to go?
        <select value={slug} onChange={(e) => setSlug(e.target.value)}>
          <option value="">Choose a country</option>
          {destinations.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
      </label>
      <div className="finder-go">
        <button className="btn btn-primary">Check how we can help</button>
        <small>Country not listed? <Link to="/contact">Ask us</Link></small>
      </div>
    </form>
  );
}

export default function Home() {
  const { home: h, services, faqs, russia } = useContent();
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
            <ul className="hero-points hero-points-copy">
              {h.hero.points.map((p, i) => <li key={i}><CheckCircle2 size={18} aria-hidden="true" /> {p}</li>)}
            </ul>
          </div>
          <div className="hero-visual"><HeroGlobe /></div>
        </div>
      </section>

      <section className="finder-wrap" id="find"><div className="container"><VisaFinder /></div></section>

      <Ticker />

      <section className="section" id="services">
        <div className="container">
          <Reveal><SectionHead title={h.servicesIntro.title} subtitle={h.servicesIntro.subtitle} /></Reveal>
          <div className="grid grid-3">
            {services.slice(0, 6).map((s, i) => (
              <Reveal key={s.slug} delay={i * 0.07}>
                <Link to={`/services/${s.slug}`} className="card service-card">
                  <span className="icon-box"><Icon name={s.icon} /></span>
                  <h3>{s.title}</h3>
                  <p>{s.short}</p>
                  <span className="more">Learn more <ArrowRight size={16} aria-hidden="true" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="center-btn"><Btn to="/services" variant="outline">View all services</Btn></div>
        </div>
      </section>

      <section className="russia-banner" id="russia">
        <div className="container russia-grid">
          <Reveal from="left">
            <span className="ru-badge">Our speciality</span>
            <h2>{h.russiaBanner.title}</h2>
            <p>{h.russiaBanner.text}</p>
            <ul className="ru-points">
              {(russia?.visaTypes || []).map((v, i) => <li key={i}><CheckCircle2 size={18} aria-hidden="true" /> {v.title}</li>)}
              <li><CheckCircle2 size={18} aria-hidden="true" /> Document review</li>
            </ul>
            <Btn to={h.russiaBanner.button.link} variant="light" arrow>{h.russiaBanner.button.label}</Btn>
          </Reveal>
          <Reveal from="right" delay={0.1}>
            {h.russiaBanner.image
              ? <Img src={h.russiaBanner.image} alt="Russia" className="russia-img" />
              : <div className="ru-flag"><Flag code="ru" name="Russia" className="flag-xl" /></div>}
          </Reveal>
        </div>
      </section>

      <Showcase />

      <section className="section section-tint" id="why-us">
        <div className="container">
          <Reveal><SectionHead title={h.whyUs.title} subtitle={h.whyUs.subtitle} /></Reveal>
          <div className="grid grid-3">
            {h.whyUs.items.map((it, i) => (
              <Reveal key={i} delay={i * 0.07}>
                <div className="feature">
                  <span className="icon-box icon-accent"><Icon name={it.icon} /></span>
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="process">
        <div className="container">
          <Reveal><SectionHead title={h.process.title} subtitle={h.process.subtitle} /></Reveal>
          <ol className="steps">
            {h.process.steps.map((s, i) => (
              <Reveal as="li" key={i} delay={i * 0.12}>
                <StepArt index={i} />
                <span className="step-n">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <Reviews />

      <section className="section section-tint" id="faq">
        <div className="container narrow">
          <Reveal><SectionHead title={h.faqIntro.title} subtitle={h.faqIntro.subtitle} center /></Reveal>
          <Reveal><Faq items={faqs.slice(0, 5)} /></Reveal>
          <div className="center-btn"><Btn to="/faq" variant="outline">See all questions</Btn></div>
        </div>
      </section>

      <CtaBand data={h.cta} fly />
    </>
  );
}