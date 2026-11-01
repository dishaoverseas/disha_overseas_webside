import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContent } from '../content.jsx';
import { ArrowRight, CheckCircle2 } from '../icons.jsx';
import { PageHero, RichText, CtaBand } from '../components/Common.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { useSeo } from '../utils.js';
import NotFound from './NotFound.jsx';

export const destLink = (d) => d.link || `/destinations/${d.slug}`;

export const Flag = ({ code, name = '', className = '' }) =>
  code ? (
    <img className={`flag ${className}`} src={`https://flagcdn.com/w160/${String(code).toLowerCase()}.png`} alt={`${name} flag`} loading="lazy"
      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
  ) : null;

export function DestCard({ d }) {
  return (
    <Link to={destLink(d)} className="dest-card">
      <Flag code={d.code} name={d.name} />
      <div className="dest-info">
        <h3>{d.name}</h3>
        <p>{d.short}</p>
        <span className="chips">{(d.visaTypes || []).map((v) => <em key={v}>{v}</em>)}</span>
      </div>
      <span className="dest-go"><ArrowRight size={18} aria-hidden="true" /></span>
    </Link>
  );
}

export function Destinations() {
  const { destinations, home } = useContent();
  useSeo('Visa Destinations', 'Tourist and business visa assistance for many countries from Disha Overseas, India.');
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('All');
  const regions = useMemo(() => ['All', ...Array.from(new Set(destinations.map((d) => d.region).filter(Boolean)))], [destinations]);
  const list = destinations.filter((d) =>
    (region === 'All' || d.region === region) && d.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <PageHero title="Visa destinations" subtitle="Tourist and business visa assistance for many countries. Choose your destination to see how we can help." />
      <section className="section">
        <div className="container">
          <div className="dest-tools">
            <input type="search" placeholder="Search a country..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search a country" />
            <div className="region-chips" role="group" aria-label="Filter by region">
              {regions.map((r) => (
                <button key={r} className={r === region ? 'on' : ''} onClick={() => setRegion(r)}>{r}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-3">
            {list.map((d) => <DestCard key={d.slug} d={d} />)}
          </div>
          {list.length === 0 && (
            <p className="center-text">No match. Your country may still be possible. <Link to="/contact">Contact us</Link> and we will check for you.</p>
          )}
        </div>
      </section>
      <CtaBand data={home.cta} />
    </>
  );
}

export function DestinationDetail() {
  const { slug } = useParams();
  const { destinations } = useContent();
  const d = destinations.find((x) => x.slug === slug);
  useSeo(d ? `${d.name} Visa` : '', d?.short);
  if (!d) return <NotFound />;
  const others = destinations.filter((x) => x.slug !== slug).slice(0, 6);
  return (
    <>
      <section className="page-hero dest-hero">
        {d.image && <img src={d.image} alt="" className="page-hero-bg" />}
        <div className="container dest-hero-in">
          <Flag code={d.code} name={d.name} className="flag-lg" />
          <div>
            <h1>{d.name} visa assistance</h1>
            <p>{d.short}</p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container detail-grid">
          <article>
            <RichText text={d.description} />
            {d.visaTypes?.length > 0 && (<><h3>Visa types</h3>
              <ul className="ticks">{d.visaTypes.map((v, i) => <li key={i}><CheckCircle2 size={18} aria-hidden="true" /> {v}</li>)}</ul></>)}
            {d.highlights?.length > 0 && (<><h3>Why apply with us</h3>
              <ul className="ticks">{d.highlights.map((v, i) => <li key={i}><CheckCircle2 size={18} aria-hidden="true" /> {v}</li>)}</ul></>)}
            {d.documents?.length > 0 && (<><h3>Common documents</h3>
              <ul className="ticks">{d.documents.map((v, i) => <li key={i}><CheckCircle2 size={18} aria-hidden="true" /> {v}</li>)}</ul>
              <p className="note">Exact requirements change often. We confirm the current list for your case.</p></>)}
          </article>
          <aside>
            <EnquiryForm title={`Enquire about ${d.name}`} country={d.name} />
            <div className="card side-list">
              <h4>Other destinations</h4>
              <ul>{others.map((o) => <li key={o.slug}><Link to={destLink(o)}>{o.name}</Link></li>)}</ul>
              <Link to="/destinations" className="more">All destinations</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}