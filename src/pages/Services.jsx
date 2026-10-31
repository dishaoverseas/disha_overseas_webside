import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContent } from '../content.jsx';
import { Icon, ArrowRight, CheckCircle2 } from '../icons.jsx';
import { PageHero, RichText, Img, Btn, CtaBand } from '../components/Common.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { useSeo } from '../utils.js';
import NotFound from './NotFound.jsx';

export function Services() {
  const { services, home } = useContent();
  useSeo('Visa Services', 'Tourist visa, business visa and Russia visa services from Disha Overseas, Gurugram.');
  return (
    <>
      <PageHero title="Our visa services" subtitle="Tourist and business visa assistance, with a special focus on Russia." />
      <section className="section">
        <div className="container grid grid-3">
          {services.map((s) => (
            <Link to={`/services/${s.slug}`} key={s.slug} className="card service-card">
              {s.image ? <img src={s.image} alt="" className="card-img" loading="lazy" /> : null}
              <span className="icon-box"><Icon name={s.icon} /></span>
              <h3>{s.title}</h3>
              <p>{s.short}</p>
              <span className="more">View details <ArrowRight size={16} aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>
      <CtaBand data={home.cta} />
    </>
  );
}

export function ServiceDetail() {
  const { slug } = useParams();
  const { services } = useContent();
  const s = services.find((x) => x.slug === slug);
  useSeo(s?.title, s?.short);
  if (!s) return <NotFound />;
  const others = services.filter((x) => x.slug !== slug).slice(0, 4);
  return (
    <>
      <PageHero title={s.title} subtitle={s.short} image={s.image} />
      <section className="section">
        <div className="container detail-grid">
          <article>
            <RichText text={s.description} />
            {s.features?.length > 0 && (
              <>
                <h3>What is included</h3>
                <ul className="ticks">
                  {s.features.map((f, i) => <li key={i}><CheckCircle2 size={18} aria-hidden="true" /> {f}</li>)}
                </ul>
              </>
            )}
            {s.documents?.length > 0 && (
              <>
                <h3>Common documents</h3>
                <ul className="ticks">
                  {s.documents.map((f, i) => <li key={i}><CheckCircle2 size={18} aria-hidden="true" /> {f}</li>)}
                </ul>
                <p className="note">Exact requirements can change. We confirm the current list for your case.</p>
              </>
            )}
          </article>
          <aside>
            <EnquiryForm title={`Enquire about ${s.title}`} />
            <div className="card side-list">
              <h4>Other services</h4>
              <ul>{others.map((o) => <li key={o.slug}><Link to={`/services/${o.slug}`}>{o.title}</Link></li>)}</ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
