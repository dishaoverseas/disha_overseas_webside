import React, { useState } from 'react';
import { useContent } from '../content.jsx';
import { MessageCircle } from '../icons.jsx';
import { waLink, track } from '../utils.js';

export default function EnquiryForm({ title, country = '' }) {
  const { services, destinations, settings } = useContent();
  const [link, setLink] = useState('');

  function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const d = Object.fromEntries(fd.entries());

    // 1. Build the WhatsApp message from everything the visitor filled in
    const text = [
      'Hello Disha Overseas, I would like to enquire about a visa.',
      '',
      `Name: ${d.name || '-'}`,
      `Phone: ${d.phone || '-'}`,
      d.email && `Email: ${d.email}`,
      d.country && `Destination: ${d.country}`,
      d.service && `Visa type: ${d.service}`,
      d.message && `Message: ${d.message}`,
    ].filter((x) => x !== '' && x !== undefined && x !== false).join('\n');
    const url = waLink(settings.whatsapp, text);

    // 2. Open WhatsApp right away (must happen directly inside the click)
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    setLink(url);
    track('Lead');

    // 3. Background copies (errors are ignored so the visitor is never blocked)
    //    The server saves the enquiry, emails it to you and adds it to your Google Sheet
    if (!d['bot-field']) {
      fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...d, page: window.location.href }),
        keepalive: true, // keeps the request alive even if the page changes
      }).catch(() => {});
    }

    if (!win) window.location.href = url; // popup blocked: open in the same tab instead
    form.reset();
  }

  if (link)
    return (
      <div className="form-card form-done" role="status">
        <h3>Almost done: tap Send in WhatsApp</h3>
        <p>WhatsApp should have opened with your details already typed in. Just press the <b>Send</b> button there and our team will reply to you.</p>
        <a className="btn btn-wa" href={link} target="_blank" rel="noreferrer"><MessageCircle size={18} /> WhatsApp did not open? Tap here</a>
        <button type="button" className="btn btn-outline" onClick={() => setLink('')}>Fill another enquiry</button>
      </div>
    );

  return (
    <form className="form-card" onSubmit={onSubmit}>
      {title && <h3>{title}</h3>}
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
      <div className="form-row">
        <label>Destination country
          <select name="country" defaultValue={country}>
            <option value="">Choose a country</option>
            {destinations.map((d) => <option key={d.slug} value={d.name}>{d.name}</option>)}
            <option value="Other">Other country</option>
          </select>
        </label>
        <label>Visa type
          <select name="service" defaultValue="">
            <option value="" disabled>Choose a service</option>
            {services.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
            <option value="Other">Other / not sure</option>
          </select>
        </label>
      </div>
      <label>Your message
        <textarea name="message" rows={4} placeholder="Travel dates, number of travellers, any questions..." />
      </label>
      <button className="btn btn-wa btn-block"><MessageCircle size={18} /> Send on WhatsApp</button>
      <small className="form-note">WhatsApp will open with your details filled in. Press Send there to reach us.</small>
    </form>
  );
}