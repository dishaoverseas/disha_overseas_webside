import React, { useState } from 'react';
import { useContent } from '../content.jsx';
import { waLink } from '../utils.js';

const encode = (fd) => new URLSearchParams(fd).toString();

export default function EnquiryForm({ title }) {
  const { services, contact, settings } = useContent();
  const [status, setStatus] = useState('idle');

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus('sending');
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(new FormData(form)),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('done');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done')
    return (
      <div className="form-card form-done" role="status">
        <h3>Enquiry received</h3>
        <p>{contact.successMessage}</p>
      </div>
    );

  return (
    <form className="form-card" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={onSubmit}>
      {title && <h3>{title}</h3>}
      <input type="hidden" name="form-name" value="contact" />
      <p className="hp"><label>Do not fill this: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
      <div className="form-row">
        <label>Full name
          <input name="name" required autoComplete="name" />
        </label>
        <label>Phone / WhatsApp
          <input name="phone" type="tel" required autoComplete="tel" />
        </label>
      </div>
      <label>Email
        <input name="email" type="email" autoComplete="email" />
      </label>
      <label>I am interested in
        <select name="service" defaultValue="">
          <option value="" disabled>Choose a service</option>
          {services.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
          <option value="Other">Other / not sure</option>
        </select>
      </label>
      <label>Your message
        <textarea name="message" rows={4} placeholder="Destination, travel dates, number of travellers..." />
      </label>
      <button className="btn btn-primary" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Send enquiry'}
      </button>
      {status === 'error' && (
        <p className="form-error" role="alert">
          We could not send your enquiry. Please try again, or <a href={waLink(settings.whatsapp)}>message us on WhatsApp</a>.
        </p>
      )}
    </form>
  );
}
