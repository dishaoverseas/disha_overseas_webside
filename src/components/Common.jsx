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

export const CtaBand = ({ data }) =>
  data ? (
    <section className="cta-band">
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

export const RichText = ({ text = '' }) => (
  <div className="rich">
    {text.split(/\n\s*\n/).map((block, i) => {
      const t = block.trim();
      if (!t) return null;
      if (t.startsWith('## ')) return <h3 key={i}>{inline(t.slice(3))}</h3>;
      if (t.startsWith('# ')) return <h2 key={i}>{inline(t.slice(2))}</h2>;
      const lines = t.split('\n');
      if (lines.every((l) => /^\s*[-*] /.test(l)))
        return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-*] /, ''))}</li>)}</ul>;
      // heading directly followed by text/list
      if (lines[0].startsWith('## ')) {
        return (
          <React.Fragment key={i}>
            <h3>{inline(lines[0].slice(3))}</h3>
            <RichText text={lines.slice(1).join('\n')} />
          </React.Fragment>
        );
      }
      return <p key={i}>{lines.map((l, j) => <React.Fragment key={j}>{j > 0 && <br />}{inline(l)}</React.Fragment>)}</p>;
    })}
  </div>
);
