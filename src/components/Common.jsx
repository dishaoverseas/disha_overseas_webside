import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, ArrowRight, ChevronDown } from '../icons.jsx';
import { isExternal } from '../utils.js';

export const SmartLink = ({ to, children, ...rest }) =>
  isExternal(to) ? (
    <a href={to} target={to.startsWith('http') ? '_blank' : undefined} rel="noreferrer" {...rest}>{children}</a>
  ) : (
    <Link to={to || '/'} {...rest}>{children}</Link>
  );

export const Btn = ({ to, variant = 'primary', children, arrow, ...rest }) => (
  <SmartLink to={to} className={`btn btn-${variant}`} {...rest}>
    {children}
    {arrow && <ArrowRight size={18} aria-hidden="true" />}
  </SmartLink>
);

export const Img = ({ src, alt = '', className = '', icon = 'Plane' }) =>
  src ? (
    <img src={src} alt={alt} className={className} loading="lazy" />
  ) : (
    <div className={`img-ph ${className}`} role="img" aria-label={alt}>
      <Icon name={icon} size={44} />
    </div>
  );

export const SectionHead = ({ title, subtitle, center }) => (
  <div className={`section-head ${center ? 'center' : ''}`}>
    <h2>{title}</h2>
    {subtitle && <p>{subtitle}</p>}
  </div>
);

export const PageHero = ({ title, subtitle, image }) => (
  <section className="page-hero">
    {image && <img src={image} alt="" className="page-hero-bg" />}
    <div className="container">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  </section>
);

export const Faq = ({ items = [] }) => (
  <div className="faq">
    {items.map((f, i) => (
      <details key={i}>
        <summary>
          <span>{f.q}</span>
          <ChevronDown size={20} aria-hidden="true" />
        </summary>
        <p>{f.a}</p>
      </details>
    ))}
  </div>
);

export const CtaBand = ({ data, fly }) =>
  data ? (
    <section className="cta-band">
      {fly && (
        <svg className="cta-plane" viewBox="-20 -16 40 32" aria-hidden="true"><path d="M17 0 L7 -2.6 L-2 -14 L-5.5 -14 L-2.5 -2.6 L-11 -2.6 L-14 -6.5 L-16.5 -6.5 L-14 0 L-16.5 6.5 L-14 6.5 L-11 2.6 L-2.5 2.6 L-5.5 14 L-2 14 L7 2.6 Z" fill="currentColor" /></svg>
      )}
      <div className="container cta-inner">
        <div>
          <h2>{data.title}</h2>
          <p>{data.text}</p>
        </div>
        {data.button && <Btn to={data.button.link} variant="light" arrow>{data.button.label}</Btn>}
      </div>
    </section>
  ) : null;

// Very small markup: blank line = paragraph, "## " = heading, "- " = bullet list, **bold**
const inline = (s) =>
  s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p));

// Very small markup: blank line = paragraph, "# / ## / ### " = headings, "- " = bullet list, **bold**
export const RichText = ({ text = '' }) => (
  <div className="rich">
    {String(text).split(/\n\s*\n/).map((block, i) => {
      const t = block.trim();
      if (!t) return null;
      const lines = t.split('\n');
      const h = /^(#{1,4})\s+(.*)$/.exec(lines[0]);
      if (h) {
        const Tag = h[1].length === 1 ? 'h2' : h[1].length >= 4 ? 'h4' : 'h3';
        return (
          <React.Fragment key={i}>
            <Tag>{inline(h[2])}</Tag>
            {lines.length > 1 && <RichText text={lines.slice(1).join('\n')} />}
          </React.Fragment>
        );
      }
      if (lines.every((l) => /^\s*[-*] /.test(l)))
        return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-*] /, ''))}</li>)}</ul>;
      return <p key={i}>{lines.map((l, j) => <React.Fragment key={j}>{j > 0 && <br />}{inline(l)}</React.Fragment>)}</p>;
    })}
  </div>
);