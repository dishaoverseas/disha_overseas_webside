import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useContent } from '../content.jsx';
import { Phone, Mail, MapPin, Menu, X, MessageCircle, Facebook, Instagram, Linkedin, Youtube, Twitter } from '../icons.jsx';
import { Btn } from './Common.jsx';
import { waLink, telLink } from '../utils.js';

const socialIcons = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, youtube: Youtube, twitter: Twitter };

export function Header() {
  const { settings: s } = useContent();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  return (
    <header className="site-header">
      <div className="topbar">
        <div className="container topbar-in">
          <span className="topbar-msg">{s.topBarText}</span>
          <div className="topbar-links">
            <a href={telLink(s.phone)}><Phone size={14} aria-hidden="true" /> {s.phone}</a>
            <a href={`mailto:${s.email}`}><Mail size={14} aria-hidden="true" /> {s.email}</a>
          </div>
        </div>
      </div>
      <div className="navbar">
        <div className="container nav-in">
          <Link to="/" className="brand" aria-label={`${s.siteName} home`}>
            <img src={s.logo} alt={s.siteName} />
            <span className="brand-text"><strong>{s.siteName}</strong><small>{s.tagline}</small></span>
          </Link>
          <nav className={`nav ${open ? 'open' : ''}`} aria-label="Main">
            {s.nav.map((n) => (
              <NavLink key={n.path} to={n.path} end={n.path === '/'}>{n.label}</NavLink>
            ))}
            <Btn to={s.navCtaLink} className="nav-cta">{s.navCtaLabel}</Btn>
          </nav>
          <button className="menu-btn" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const { settings: s, services } = useContent();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-logo"><img src={s.logo} alt={s.siteName} /></div>
          <p className="footer-about">{s.footerAbout}</p>
          <div className="socials">
            {Object.entries(socialIcons).map(([k, I]) =>
              s.social?.[k] ? <a key={k} href={s.social[k]} target="_blank" rel="noreferrer" aria-label={k}><I size={18} /></a> : null
            )}
          </div>
        </div>
        <div>
          <h4>Quick links</h4>
          <ul>
            {s.nav.map((n) => <li key={n.path}><Link to={n.path}>{n.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4>Services</h4>
          <ul>
            {services.slice(0, 6).map((sv) => <li key={sv.slug}><Link to={`/services/${sv.slug}`}>{sv.title}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul className="contact-list">
            <li><MapPin size={16} aria-hidden="true" /> {s.address}</li>
            <li><Phone size={16} aria-hidden="true" /> <a href={telLink(s.phone)}>{s.phone}</a></li>
            <li><Mail size={16} aria-hidden="true" /> <a href={`mailto:${s.email}`}>{s.email}</a></li>
            <li className="muted">{s.hours}</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <p className="disclaimer">{s.disclaimer}</p>
        <div className="footer-meta">
          <span>&copy; {year} {s.copyright}</span>
          <span><Link to="/privacy-policy">Privacy Policy</Link> <Link to="/terms">Terms</Link></span>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFloat() {
  const { settings: s } = useContent();
  if (!s.whatsapp) return null;
  return (
    <a className="wa-float" href={waLink(s.whatsapp)} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
      <MessageCircle size={26} />
      <span>Chat with us</span>
    </a>
  );
}
