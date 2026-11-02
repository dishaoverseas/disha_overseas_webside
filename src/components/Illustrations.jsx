import React from 'react';

// Small flat illustrations for the "How it works" steps. They use the brand colours automatically.
const S = ({ children }) => (
  <svg viewBox="0 0 160 110" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">{children}</svg>
);

const Chat = () => (
  <S>
    <rect x="14" y="12" width="92" height="50" rx="14" fill="var(--navy)" />
    <path d="M34 62 L28 82 L54 62Z" fill="var(--navy)" />
    <rect x="30" y="26" width="60" height="6" rx="3" fill="#fff" opacity=".95" />
    <rect x="30" y="40" width="38" height="6" rx="3" fill="#fff" opacity=".6" />
    <rect x="74" y="50" width="72" height="44" rx="14" fill="var(--accent)" />
    <path d="M128 94 L136 106 L112 94Z" fill="var(--accent)" />
    <circle cx="96" cy="72" r="4.5" fill="#fff" />
    <circle cx="110" cy="72" r="4.5" fill="#fff" opacity=".8" />
    <circle cx="124" cy="72" r="4.5" fill="#fff" opacity=".6" />
  </S>
);

const Docs = () => (
  <S>
    <g transform="rotate(-8 62 58)">
      <rect x="30" y="14" width="64" height="84" rx="8" fill="var(--navy-line)" />
    </g>
    <rect x="52" y="10" width="68" height="88" rx="8" fill="#fff" stroke="var(--navy)" strokeWidth="3" />
    <rect x="62" y="24" width="30" height="6" rx="3" fill="var(--navy)" />
    <rect x="62" y="38" width="48" height="5" rx="2.5" fill="var(--navy-line)" />
    <rect x="62" y="50" width="48" height="5" rx="2.5" fill="var(--navy-line)" />
    <rect x="62" y="62" width="34" height="5" rx="2.5" fill="var(--navy-line)" />
    <circle cx="116" cy="86" r="19" fill="#1f9d55" />
    <path d="M107 86 l7 7 l12 -14" stroke="#fff" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

const Form = () => (
  <S>
    <rect x="38" y="12" width="76" height="90" rx="10" fill="var(--navy)" />
    <rect x="46" y="26" width="60" height="68" rx="5" fill="#fff" />
    <rect x="64" y="6" width="40" height="16" rx="6" fill="var(--accent)" />
    <rect x="53" y="36" width="9" height="9" rx="2" fill="none" stroke="var(--navy)" strokeWidth="2" />
    <path d="M55 40 l2 2.5 l4 -5" stroke="#1f9d55" strokeWidth="2" fill="none" strokeLinecap="round" />
    <rect x="68" y="38" width="30" height="5" rx="2.5" fill="var(--navy-line)" />
    <rect x="53" y="54" width="9" height="9" rx="2" fill="none" stroke="var(--navy)" strokeWidth="2" />
    <path d="M55 58 l2 2.5 l4 -5" stroke="#1f9d55" strokeWidth="2" fill="none" strokeLinecap="round" />
    <rect x="68" y="56" width="24" height="5" rx="2.5" fill="var(--navy-line)" />
    <rect x="53" y="72" width="9" height="9" rx="2" fill="none" stroke="var(--navy)" strokeWidth="2" />
    <rect x="68" y="74" width="30" height="5" rx="2.5" fill="var(--navy-line)" />
    <g transform="rotate(35 128 60)">
      <rect x="122" y="22" width="12" height="52" rx="3" fill="var(--accent)" />
      <path d="M122 74 L134 74 L128 88Z" fill="#f6c453" />
    </g>
  </S>
);

const Plane = () => (
  <S>
    <circle cx="80" cy="56" r="44" fill="var(--navy-line)" opacity=".55" />
    <path d="M18 92 C 44 40, 86 100, 122 44" fill="none" stroke="var(--navy)" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
    <circle cx="18" cy="92" r="6" fill="var(--navy)" />
    <g transform="translate(120 38) rotate(-18)">
      <path d="M-24 -4 L28 -18 L10 24 L-2 8 Z" fill="var(--accent)" />
      <path d="M-2 8 L28 -18 L-8 14 Z" fill="color-mix(in srgb, var(--accent) 65%, #000)" />
    </g>
  </S>
);

const Passport = () => (
  <S>
    <rect x="42" y="10" width="72" height="92" rx="9" fill="var(--navy)" />
    <rect x="42" y="10" width="10" height="92" rx="4" fill="color-mix(in srgb, var(--navy) 70%, #000)" />
    <circle cx="82" cy="46" r="17" fill="none" stroke="#fff" strokeWidth="2.5" opacity=".9" />
    <ellipse cx="82" cy="46" rx="7" ry="17" fill="none" stroke="#fff" strokeWidth="2" opacity=".7" />
    <path d="M65 46 H99 M69 36 H95 M69 56 H95" stroke="#fff" strokeWidth="2" opacity=".7" />
    <rect x="66" y="74" width="32" height="5" rx="2.5" fill="#fff" opacity=".85" />
    <rect x="72" y="85" width="20" height="4" rx="2" fill="#fff" opacity=".5" />
    <g transform="rotate(-14 118 80)">
      <circle cx="118" cy="80" r="21" fill="none" stroke="var(--accent)" strokeWidth="4" />
      <circle cx="118" cy="80" r="15" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      <path d="M108 80 l7 7 l13 -15" stroke="var(--accent)" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  </S>
);

const ART = [Chat, Docs, Form, Plane, Passport];

export const StepArt = ({ index = 0 }) => {
  const C = ART[index % ART.length];
  return <div className="step-art"><C /></div>;
};