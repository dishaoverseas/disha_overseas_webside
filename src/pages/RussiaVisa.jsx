import React from 'react';
import { useContent } from '../content.jsx';
import { CheckCircle2 } from '../icons.jsx';
import { PageHero, RichText, Faq, SectionHead, CtaBand } from '../components/Common.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { useSeo } from '../utils.js';

export default function RussiaVisa() {
  const { russia: r, home } = useContent();
  useSeo('Russia Visa', r.hero.subtitle);
  return (
    <>
      <PageHero title={r.hero.title} subtitle={r.hero.subtitle} image={r.hero.image} />

      <section className="section">
        <div className="container detail-grid">
          <div>
            <h2>{r.overview.title}</h2>
            <RichText text={r.overview.text} />
            <div className="grid grid-2 visa-types">
              {r.visaTypes.map((v, i) => (
                <div key={i} className="card">
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                  <ul className="ticks">
                    {v.points.map((p, k) => <li key={k}><CheckCircle2 size={18} aria-hidden="true" /> {p}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <aside><EnquiryForm title="Ask about your Russia visa" /></aside>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container split">
          <div>
            <h2>{r.documents.title}</h2>
            <p className="note">{r.documents.note}</p>
          </div>
          <ul className="doc-list">
            {r.documents.items.map((d, i) => <li key={i}><CheckCircle2 size={18} aria-hidden="true" /> {d}</li>)}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead title={r.steps.title} />
          <ol className="steps steps-5">
            {r.steps.items.map((s, i) => (
              <li key={i}><span className="step-n">{i + 1}</span><h3>{s.title}</h3><p>{s.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-tint">
        <div className="container grid grid-2 gap-lg">
          <div className="notice">
            <h3>{r.notes.title}</h3>
            <RichText text={r.notes.text} />
          </div>
          <div>
            <h3>Russia visa questions</h3>
            <Faq items={r.faqs} />
          </div>
        </div>
      </section>

      <CtaBand data={home.cta} />
    </>
  );
}
