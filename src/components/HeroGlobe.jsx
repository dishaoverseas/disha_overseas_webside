import React, { useState } from 'react';

// Animated globe for the home page hero: routes are drawn from India to popular destinations
// and planes fly along them. Pure SVG, no libraries. Respects "reduce motion" settings.
const CX = 280, CY = 266, R = 205;
const LON0 = 62;                         // the globe is centred on Asia / Europe
const TILT = (16 * Math.PI) / 180;
const rad = (d) => (d * Math.PI) / 180;

function project(lat, lon) {
  const la = rad(lat), dl = rad(lon - LON0);
  return [CX + R * Math.cos(la) * Math.sin(dl), CY - R * (Math.cos(TILT) * Math.sin(la) - Math.sin(TILT) * Math.cos(la) * Math.cos(dl))];
}

const DELHI = project(28.6, 77.2);
const DESTS = [
  { name: 'Russia', lat: 55.75, lon: 37.6, hot: true, dur: 6.6, begin: 1.3, draw: 0.3, lab: [13, -9, 'start'] },
  { name: 'UK', lat: 51.5, lon: -0.1, dur: 7.4, begin: 3.4, draw: 0.9, lab: [-10, 4, 'end'] },
  { name: 'UAE', lat: 25.2, lon: 55.3, dur: 5.2, begin: 2.4, draw: 0.6, lab: [-10, 5, 'end'] },
  { name: 'Thailand', lat: 13.75, lon: 100.5, dur: 6, begin: 4.6, draw: 1.2, lab: [11, 5, 'start'] },
  { name: 'Japan', lat: 35.7, lon: 139.7, dur: 8, begin: 5.6, draw: 1.5, lab: [11, 5, 'start'] },
].map((d) => {
  const to = project(d.lat, d.lon);
  const mx = (DELHI[0] + to[0]) / 2, my = (DELHI[1] + to[1]) / 2;
  const ctrl = [mx + (mx - CX) * 0.42, my + (my - CY) * 0.42 - 30];
  const f = (n) => n.toFixed(1);
  return { ...d, to, ctrl, path: `M${f(DELHI[0])} ${f(DELHI[1])} Q${f(ctrl[0])} ${f(ctrl[1])} ${f(to[0])} ${f(to[1])}` };
});

// where a plane sits (and which way it points) halfway along a route, used when motion is reduced
function midPose(d) {
  const t = 0.5, [x0, y0] = DELHI, [cx, cy] = d.ctrl, [x1, y1] = d.to;
  const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1, y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1;
  const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx), dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
  return `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((Math.atan2(dy, dx) * 180) / Math.PI).toFixed(1)})`;
}

const PLANE = 'M17 0 L7 -2.6 L-2 -14 L-5.5 -14 L-2.5 -2.6 L-11 -2.6 L-14 -6.5 L-16.5 -6.5 L-14 0 L-16.5 6.5 L-14 6.5 L-11 2.6 L-2.5 2.6 L-5.5 14 L-2 14 L7 2.6 Z';

const STARS = (() => {
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: 22 }, () => {
    const a = rnd() * Math.PI * 2, d = R * 1.12 + rnd() * 120;
    return { x: CX + Math.cos(a) * d * 1.15, y: CY + Math.sin(a) * d * 0.9, r: 0.8 + rnd() * 1.4, t: 2.4 + rnd() * 3, b: rnd() * 3 };
  }).filter((p) => p.x > 6 && p.x < 554 && p.y > 6 && p.y < 514);
})();

const MERIDIANS = [0, 1, 2, 3, 4, 5].map((i) => {
  const phase = (i * Math.PI) / 6, steps = 24;
  return { i, vals: Array.from({ length: steps + 1 }, (_, k) => (R * Math.abs(Math.sin(phase + (2 * Math.PI * k) / steps))).toFixed(1)).join(';'), still: (R * Math.abs(Math.sin(phase + 0.5))).toFixed(1) };
});
const PARALLELS = [-60, -30, 0, 30, 60].map((lat) => ({ lat, cy: CY - R * Math.sin(rad(lat)) * Math.cos(TILT), rx: R * Math.cos(rad(lat)), ry: R * Math.cos(rad(lat)) * Math.sin(TILT) }));

export default function HeroGlobe() {
  const [still] = useState(() => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  return (
    <div className="hero-globe" aria-hidden="true">
      <svg viewBox="0 0 560 520" role="img" focusable="false">
        <defs>
          <radialGradient id="hg-sphere" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#6c9bff" stopOpacity=".5" />
            <stop offset=".6" stopColor="#2150b4" stopOpacity=".28" />
            <stop offset="1" stopColor="#0a2a66" stopOpacity=".06" />
          </radialGradient>
          <radialGradient id="hg-glow" cx="50%" cy="50%" r="50%">
            <stop offset=".84" stopColor="#8db8ff" stopOpacity="0" />
            <stop offset=".96" stopColor="#8db8ff" stopOpacity=".38" />
            <stop offset="1" stopColor="#8db8ff" stopOpacity="0" />
          </radialGradient>
          <pattern id="hg-dots" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1" fill="#fff" opacity=".17" /></pattern>
          <clipPath id="hg-clip"><circle cx={CX} cy={CY} r={R} /></clipPath>
        </defs>

        {STARS.map((s, i) => (
          <circle key={i} cx={s.x.toFixed(1)} cy={s.y.toFixed(1)} r={s.r.toFixed(1)} fill="#fff" opacity={still ? 0.5 : 0.2}>
            {!still && <animate attributeName="opacity" values=".15;.95;.15" dur={`${s.t.toFixed(1)}s`} begin={`${s.b.toFixed(1)}s`} repeatCount="indefinite" />}
          </circle>
        ))}

        <circle cx={CX} cy={CY} r={R + 26} fill="url(#hg-glow)" />
        <circle cx={CX} cy={CY} r={R} fill="url(#hg-sphere)" />
        <circle cx={CX} cy={CY} r={R} fill="url(#hg-dots)" />

        <g clipPath="url(#hg-clip)" fill="none" stroke="#fff" strokeOpacity=".2" strokeWidth="1">
          {PARALLELS.map((p) => <ellipse key={p.lat} cx={CX} cy={p.cy.toFixed(1)} rx={p.rx.toFixed(1)} ry={p.ry.toFixed(1)} strokeOpacity={p.lat === 0 ? 0.34 : 0.2} />)}
          {MERIDIANS.map((m) => (
            <ellipse key={m.i} cx={CX} cy={CY} rx={still ? m.still : 0} ry={R}>
              {!still && <animate attributeName="rx" values={m.vals} dur="42s" repeatCount="indefinite" />}
            </ellipse>
          ))}
        </g>
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#bcd4ff" strokeOpacity=".45" strokeWidth="1.4" />

        {DESTS.map((d) => (
          <g key={d.name}>
            <path d={d.path} pathLength="1" className="route-base" stroke={d.hot ? '#ff6b78' : '#cfe0ff'} />
            <path d={d.path} pathLength="1" className="route-draw" stroke={d.hot ? '#ff6b78' : '#e8f0ff'} style={{ '--d': `${d.draw}s` }} />
          </g>
        ))}

        {DESTS.map((d) => {
          const [lx, ly, anchor] = d.lab;
          return (
            <g key={d.name + '-city'}>
              <circle cx={d.to[0].toFixed(1)} cy={d.to[1].toFixed(1)} r={d.hot ? 5.5 : 4} fill={d.hot ? '#ff4d5e' : '#fff'} stroke="#0a2a66" strokeWidth="1.5" />
              {d.hot && !still && (
                <circle cx={d.to[0].toFixed(1)} cy={d.to[1].toFixed(1)} r="6" fill="none" stroke="#ff6b78" strokeWidth="2">
                  <animate attributeName="r" values="6;22" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values=".8;0" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}
              <text x={(d.to[0] + lx).toFixed(1)} y={(d.to[1] + ly).toFixed(1)} textAnchor={anchor} className={d.hot ? 'city-label hot' : 'city-label'}>{d.name}</text>
            </g>
          );
        })}

        <circle cx={DELHI[0].toFixed(1)} cy={DELHI[1].toFixed(1)} r="6" fill="#fff" stroke="#0a2a66" strokeWidth="2" />
        {!still && (
          <circle cx={DELHI[0].toFixed(1)} cy={DELHI[1].toFixed(1)} r="6" fill="none" stroke="#fff" strokeWidth="2">
            <animate attributeName="r" values="6;26" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values=".85;0" dur="2.6s" repeatCount="indefinite" />
          </circle>
        )}
        <text x={(DELHI[0] + 12).toFixed(1)} y={(DELHI[1] + 21).toFixed(1)} className="city-label home">India</text>

        {DESTS.map((d) => (
          still ? (
            <g key={d.name + '-plane'} transform={midPose(d)}>
              <path d={PLANE} fill="#fff" />
            </g>
          ) : (
            <g key={d.name + '-plane'}>
              <path d={d.path} pathLength="1" fill="none" stroke={d.hot ? '#ffb3ba' : '#fff'} strokeWidth="3" strokeLinecap="round" strokeDasharray="0.16 1" strokeDashoffset="0.16" opacity="0">
                <animate attributeName="stroke-dashoffset" values="0.16;-0.84" keyTimes="0;1" calcMode="spline" keySplines=".35 0 .65 1" dur={`${d.dur}s`} begin={`${d.begin}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;.85;.85;0" keyTimes="0;.12;.88;1" dur={`${d.dur}s`} begin={`${d.begin}s`} repeatCount="indefinite" />
              </path>
              <g opacity="0">
                <g transform={`scale(${d.hot ? 1.5 : 1.15})`}><path d={PLANE} fill="#fff" stroke={d.hot ? '#d6202f' : 'none'} strokeWidth="1.2" /></g>
                <animateMotion path={d.path} dur={`${d.dur}s`} begin={`${d.begin}s`} repeatCount="indefinite" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".35 0 .65 1" />
                <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur={`${d.dur}s`} begin={`${d.begin}s`} repeatCount="indefinite" />
              </g>
            </g>
          )
        ))}
      </svg>
    </div>
  );
}
