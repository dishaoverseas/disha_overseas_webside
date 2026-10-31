import React from 'react';
import { useContent } from '../content.jsx';
import { Phone, Mail, MapPin, Calendar, MessageCircle } from '../icons.jsx';
import { PageHero, Faq, RichText } from '../components/Common.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { useSeo, waLink, telLink, formatDate } from '../utils.js';

export function FaqPage() {
  const { faqPage, faqs } = useContent();
  useSeo('FAQ', faqPage.subtitle);
  return (
    <>
      <PageHero title={faqPage.title} subtitle={faqPage.subtitle} />
      <section className="section"><div className="container narrow"><Faq items={faqs} /></div></section>
    </>
  );
}

export function Contact() {
  const { contact: c, settings: s } = useContent();
  useSeo('Contact Us', c.subtitle);
  return (
    <>
      <PageHero title={c.title} subtitle={c.subtitle} />
      <section className="section">
        <div className="container contact-grid">
          <div>
            <h2>{c.infoTitle}</h2>
            <ul className="info-list">
              <li><span className="icon-box"><MapPin /></span><div><strong>Address</strong><p>{s.address}</p></div></li>
              <li><span className="icon-box"><Phone /></span><div><strong>Phone</strong><p><a href={telLink(s.phone)}>{s.phone}</a></p></div></li>
              <li><span className="icon-box"><Mail /></span><div><strong>Email</strong><p><a href={`mailto:${s.email}`}>{s.email}</a></p></div></li>
              <li><span className="icon-box"><Calendar /></span><div><strong>Working hours</strong><p>{s.hours}</p></div></li>
            </ul>
            {s.whatsapp && (
              <a className="btn btn-wa" href={waLink(s.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Chat on WhatsApp</a>
            )}
          </div>
          <EnquiryForm title={c.formTitle} />
        </div>
        {c.mapEmbedUrl && (
          <div className="container map">
            <iframe title="Office location" src={c.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
        )}
      </section>
    </>
  );
}

export function Legal({ type }) {
  const { legal } = useContent();
  const d = legal[type];
  useSeo(d.title);
  return (
    <>
      <PageHero title={d.title} subtitle={d.updated ? `Last updated ${formatDate(d.updated)}` : ''} />
      <section className="section"><div className="container narrow"><RichText text={d.content} /></div></section>
    </>
  );
}
