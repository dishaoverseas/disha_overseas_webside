import React from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../content.jsx';
import { Flag, destLink } from '../pages/Destinations.jsx';

// A slowly moving strip of country flags (taken from Admin > Destinations)
export default function Ticker() {
  const { destinations = [] } = useContent();
  const list = destinations.filter((d) => d && d.name);
  if (list.length < 3) return null;
  const set = Array.from({ length: Math.max(1, Math.ceil(12 / list.length)) }).flatMap(() => list);
  return (
    <div className="ticker" aria-label="Countries we assist with">
      <span className="ticker-title">We assist with visas for</span>
      <div className="ticker-mask">
        <div className="ticker-track" style={{ '--tk-dur': `${set.length * 3.2}s` }}>
          {[0, 1].map((r) => set.map((d, i) => (
            <Link key={`${r}-${i}`} to={destLink(d)} className="tick-item" tabIndex={r ? -1 : 0} aria-hidden={r ? 'true' : undefined}>
              <Flag code={d.code} name={d.name} /> {d.name}
            </Link>
          )))}
        </div>
      </div>
    </div>
  );
}