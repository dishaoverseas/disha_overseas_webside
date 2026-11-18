import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Wraps content so it fades and slides in when it scrolls into view
export const Reveal = ({ as: Tag = 'div', delay = 0, from = 'up', className = '', children, ...rest }) => (
  <Tag className={`reveal reveal-${from} ${className}`.trim()} style={{ '--rd': `${delay}s` }} {...rest}>{children}</Tag>
);

// 1) reveals elements as they scroll into view  2) scrolls to #sections (used by the assistant and links)
export function MotionManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal:not(.in)'));
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return undefined; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach((e) => io.observe(e));
    const safety = setTimeout(() => els.forEach((e) => { if (e.getBoundingClientRect().top < window.innerHeight) e.classList.add('in'); }), 1500);
    return () => { io.disconnect(); clearTimeout(safety); };
  }, [pathname]);

  useEffect(() => {
    if (!hash) return undefined;
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    let timer;
    const go = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
        setTimeout(() => el.classList.remove('flash'), 1800);
      } else if (tries++ < 12) timer = setTimeout(go, 120);
    };
    timer = setTimeout(go, 80);
    return () => clearTimeout(timer);
  }, [pathname, hash]);

  return null;
}