// Builds the text that search engines and AI tools read, straight from your admin content.
// The website itself is an app that draws its pages in the browser. Crawlers that do not run JavaScript
// (and AI assistants) would otherwise see an empty page, so the server adds a plain text copy of each page,
// a proper title and description per page, structured data (schema.org) and an llms.txt summary.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (s, n) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };
const inline = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const plain = (s) => String(s ?? '').replace(/\*\*/g, '').replace(/^#{1,4}\s+/gm, '').replace(/^\s*[-*]\s+/gm, '').replace(/\s+/g, ' ').trim();

// same tiny markup the website uses: blank line = paragraph, "## " = heading, "- " = bullet list
export function richHtml(text = '') {
  return String(text).split(/\n\s*\n/).map((block) => {
    const t = block.trim();
    if (!t) return '';
    const lines = t.split('\n');
    const h = /^(#{1,4})\s+(.*)$/.exec(lines[0]);
    if (h) return `<h${Math.min(4, h[1].length + 1)}>${inline(h[2])}</h${Math.min(4, h[1].length + 1)}>${lines.length > 1 ? richHtml(lines.slice(1).join('\n')) : ''}`;
    if (lines.every((l) => /^\s*[-*] /.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*] /, ''))}</li>`).join('')}</ul>`;
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}

const list = (items, fn) => (items?.length ? `<ul>${items.map(fn).join('')}</ul>` : '');
const link = (href, label) => `<a href="${esc(href)}">${esc(label)}</a>`;

export function orgSchema(c, base) {
  const s = c.settings || {};
  const abs = (u) => (!u ? '' : /^https?:/.test(u) ? u : base + (u.startsWith('/') ? u : '/' + u));
  const sameAs = Object.values(s.social || {}).filter((u) => /^https?:/.test(u));
  return {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', name: s.siteName, url: base, logo: abs(s.logo), image: abs(s.seo?.image || s.logo),
    description: s.seo?.description || undefined, areaServed: 'India', priceRange: undefined,
    ...(s.phone ? { telephone: s.phone } : {}), ...(s.email ? { email: s.email } : {}),
    ...(s.address ? { address: { '@type': 'PostalAddress', streetAddress: s.address, addressCountry: 'IN' } } : {}),
    ...(sameAs.length ? { sameAs: [...new Set(sameAs)] } : {}),
  };
}

export function routeInfo(pathname, c, base) {
  const s = c.settings || {};
  const site = s.siteName || 'Disha Overseas';
  const p = String(pathname || '/').replace(/\/+$/, '') || '/';
  const url = base + (p === '/' ? '' : p);
  const withSite = (name) => clip(`${name} | ${site}`, 68);
  const crumbs = (name) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: base + '/' }, { '@type': 'ListItem', position: 2, name, item: url }] });
  const faqSchema = (items) => (items?.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })) } : null);
  const faqHtml = (items) => (items?.length ? items.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('') : '');
  const services = c.services || [], dests = c.destinations || [], blog = c.blog || [];

  const nav = (s.nav || []).map((n) => link(n.path, n.label)).join(' ');
  const contact = `<h2>Contact ${esc(site)}</h2><p>${[s.address && esc(s.address), s.phone && `Phone: ${esc(s.phone)}`, s.landline && `Office landline: ${esc(s.landline)}`, s.email && `Email: ${esc(s.email)}`, s.hours && `Hours: ${esc(s.hours)}`].filter(Boolean).join('<br>')}</p>`;
  const wrap = (body) => `<header><nav aria-label="Main">${nav}</nav></header><main>${body}</main><footer>${contact}<p>${esc(s.disclaimer || '')}</p></footer>`;
  const page = (title, description, body, schemas = [], name = '') => ({ known: true, title, description: clip(plain(description), 160), body: wrap(body), schemas: [...schemas, ...(name ? [crumbs(name)] : [])] });

  // ---- home ----
  if (p === '/') {
    const h = c.home || {};
    const body = `<h1>${esc(h.hero?.title)}</h1><p>${esc(h.hero?.subtitle)}</p>`
      + `<h2>${esc(h.servicesIntro?.title || 'Our visa services')}</h2>${list(services, (x) => `<li>${link('/services/' + x.slug, x.title)}: ${esc(x.short)}</li>`)}`
      + `<h2>${esc(h.russiaBanner?.title || 'Russia visas')}</h2><p>${esc(h.russiaBanner?.text)}</p>${link('/russia-visa', 'Russia visa assistance')}`
      + `<h2>Countries we assist with</h2>${list(dests, (d) => `<li>${link(d.link || '/destinations/' + d.slug, d.name)}: ${esc(d.short)}</li>`)}`
      + `<h2>${esc(h.whyUs?.title || 'Why choose us')}</h2>${list(h.whyUs?.items, (i) => `<li><strong>${esc(i.title)}</strong>: ${esc(i.text)}</li>`)}`
      + `<h2>${esc(h.process?.title || 'How it works')}</h2><ol>${(h.process?.steps || []).map((x) => `<li><strong>${esc(x.title)}</strong>: ${esc(x.text)}</li>`).join('')}</ol>`
      + `<h2>${esc(h.faqIntro?.title || 'Frequently asked questions')}</h2>${faqHtml((c.faqs || []).slice(0, 5))}`;
    const web = { '@context': 'https://schema.org', '@type': 'WebSite', name: site, url: base + '/' };
    return page(s.seo?.title || site, s.seo?.description || h.hero?.subtitle, body, [web, faqSchema((c.faqs || []).slice(0, 5))].filter(Boolean));
  }

  if (p === '/about') {
    const a = c.about || {};
    const body = `<h1>${esc(a.hero?.title || 'About us')}</h1><p>${esc(a.hero?.subtitle)}</p><h2>${esc(a.company?.title || 'Who we are')}</h2>${richHtml(a.company?.text)}`
      + `<h2>Mission</h2><p>${esc(a.company?.mission)}</p><h2>Vision</h2><p>${esc(a.company?.vision)}</p>`
      + `<h2>${esc(a.founder?.title || 'Founder')}</h2><h3>${esc(a.founder?.name)}</h3><p>${esc(a.founder?.role)}</p>${richHtml(a.founder?.bio)}${a.founder?.quote ? `<blockquote>${esc(a.founder.quote)}</blockquote>` : ''}`
      + list(a.founder?.highlights, (x) => `<li>${esc(x)}</li>`);
    return page(withSite('About Us'), a.hero?.subtitle || plain(a.company?.text), body, [], 'About');
  }

  if (p === '/services') {
    const body = `<h1>Our visa services</h1>${list(services, (x) => `<li>${link('/services/' + x.slug, x.title)}: ${esc(x.short)}</li>`)}`;
    return page(withSite('Visa Services'), 'Tourist visa, business visa and Russia visa services: application support, documentation and guidance from ' + site + '.', body, [], 'Services');
  }
  let m = /^\/services\/([^/]+)$/.exec(p);
  if (m) {
    const x = services.find((i) => i.slug === m[1]);
    if (!x) return notFound(site, nav, contact);
    const body = `<h1>${esc(x.title)}</h1><p>${esc(x.short)}</p>${richHtml(x.description)}${x.features?.length ? `<h2>What is included</h2>${list(x.features, (f) => `<li>${esc(f)}</li>`)}` : ''}${x.documents?.length ? `<h2>Common documents</h2>${list(x.documents, (f) => `<li>${esc(f)}</li>`)}` : ''}`;
    const svc = { '@context': 'https://schema.org', '@type': 'Service', name: x.title, description: plain(x.short), areaServed: 'India', provider: { '@type': 'ProfessionalService', name: site, url: base } };
    return page(withSite(x.title), x.short, body, [svc], x.title);
  }

  if (p === '/destinations') {
    const body = `<h1>Visa destinations</h1>${list(dests, (d) => `<li>${link(d.link || '/destinations/' + d.slug, d.name)}: ${esc(d.short)}</li>`)}`;
    return page(withSite('Visa Destinations'), 'Tourist and business visa assistance for many countries including ' + dests.slice(0, 6).map((d) => d.name).join(', ') + '.', body, [], 'Destinations');
  }
  m = /^\/destinations\/([^/]+)$/.exec(p);
  if (m) {
    const d = dests.find((i) => i.slug === m[1]);
    if (!d) return notFound(site, nav, contact);
    const body = `<h1>${esc(d.name)} visa assistance</h1><p>${esc(d.short)}</p>${richHtml(d.description)}${d.visaTypes?.length ? `<h2>Visa types</h2>${list(d.visaTypes, (v) => `<li>${esc(v)}</li>`)}` : ''}${d.highlights?.length ? `<h2>Why apply with us</h2>${list(d.highlights, (v) => `<li>${esc(v)}</li>`)}` : ''}${d.documents?.length ? `<h2>Common documents</h2>${list(d.documents, (v) => `<li>${esc(v)}</li>`)}` : ''}`;
    const svc = { '@context': 'https://schema.org', '@type': 'Service', name: `${d.name} visa assistance`, description: plain(d.short), areaServed: 'India', provider: { '@type': 'ProfessionalService', name: site, url: base } };
    return page(withSite(`${d.name} Visa`), d.short, body, [svc], d.name);
  }

  if (p === '/russia-visa') {
    const r = c.russia || {};
    const body = `<h1>${esc(r.hero?.title || 'Russia visa assistance')}</h1><p>${esc(r.hero?.subtitle)}</p><h2>${esc(r.overview?.title)}</h2>${richHtml(r.overview?.text)}`
      + (r.visaTypes || []).map((v) => `<h3>${esc(v.title)}</h3><p>${esc(v.text)}</p>${list(v.points, (x) => `<li>${esc(x)}</li>`)}`).join('')
      + `<h2>${esc(r.documents?.title)}</h2><p>${esc(r.documents?.note)}</p>${list(r.documents?.items, (x) => `<li>${esc(x)}</li>`)}`
      + `<h2>${esc(r.steps?.title)}</h2><ol>${(r.steps?.items || []).map((x) => `<li><strong>${esc(x.title)}</strong>: ${esc(x.text)}</li>`).join('')}</ol>`
      + `<h2>${esc(r.notes?.title)}</h2>${richHtml(r.notes?.text)}<h2>Russia visa questions</h2>${faqHtml(r.faqs)}`;
    const svc = { '@context': 'https://schema.org', '@type': 'Service', name: 'Russia visa assistance', description: plain(r.hero?.subtitle), areaServed: 'India', provider: { '@type': 'ProfessionalService', name: site, url: base } };
    return page(withSite('Russia Visa Assistance'), r.hero?.subtitle, body, [svc, faqSchema(r.faqs)].filter(Boolean), 'Russia Visa');
  }

  if (p === '/blog') {
    const body = `<h1>Visa guides and updates</h1>${list(blog, (b) => `<li>${link('/blog/' + b.slug, b.title)}: ${esc(b.excerpt)}</li>`)}`;
    return page(withSite('Visa Guides and Updates'), 'Practical visa tips and guides from ' + site + '.', body, [], 'Blog');
  }
  m = /^\/blog\/([^/]+)$/.exec(p);
  if (m) {
    const b = blog.find((i) => i.slug === m[1]);
    if (!b) return notFound(site, nav, contact);
    const post = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: b.title, description: plain(b.excerpt), datePublished: b.date || undefined, author: { '@type': 'Person', name: b.author || site }, publisher: { '@type': 'Organization', name: site }, mainEntityOfPage: url, ...(b.image ? { image: /^https?:/.test(b.image) ? b.image : base + b.image } : {}) };
    return page(withSite(b.title), b.excerpt, `<article><h1>${esc(b.title)}</h1><p>${esc(b.date || '')} ${esc(b.author || '')}</p>${richHtml(b.content)}</article>`, [post], b.title);
  }

  if (p === '/faq') {
    const f = c.faqPage || {};
    return page(withSite(f.title || 'FAQ'), f.subtitle || 'Answers to common visa questions.', `<h1>${esc(f.title || 'FAQ')}</h1>${faqHtml(c.faqs)}`, [faqSchema(c.faqs)].filter(Boolean), 'FAQ');
  }
  if (p === '/contact') {
    const t = c.contact || {};
    return page(withSite(t.title || 'Contact Us'), t.subtitle || 'Contact ' + site + ' for a free first consultation.', `<h1>${esc(t.title || 'Contact us')}</h1><p>${esc(t.subtitle)}</p>`, [], 'Contact');
  }
  if (p === '/privacy-policy' || p === '/terms') {
    const d = c.legal?.[p === '/terms' ? 'terms' : 'privacy'] || {};
    return page(withSite(d.title || 'Policy'), plain(d.content).slice(0, 200), `<h1>${esc(d.title)}</h1>${richHtml(d.content)}`);
  }
  return notFound(site, nav, contact);
}

function notFound(site, nav, contact) {
  return { known: false, title: `Page not found | ${site}`, description: '', body: `<header><nav aria-label="Main">${nav}</nav></header><main><h1>Page not found</h1><p>The page you are looking for does not exist.</p></main><footer>${contact}</footer>`, schemas: [] };
}

// short plain text summary that AI tools can read (https://yoursite/llms.txt)
export function llmsTxt(c, base) {
  const s = c.settings || {};
  const L = [`# ${s.siteName || 'Disha Overseas'}`, '', `> ${plain(s.seo?.description || s.footerAbout || '')}`, ''];
  L.push('## About', plain(c.about?.company?.text || s.footerAbout), '');
  if (c.about?.founder?.name) L.push(`Founder: ${plain(c.about.founder.name)}. ${plain(c.about.founder.bio).slice(0, 400)}`, '');
  L.push('## Services', ...(c.services || []).map((x) => `- [${x.title}](${base}/services/${x.slug}): ${plain(x.short)}`), '');
  L.push('## Destinations', ...(c.destinations || []).map((d) => `- [${d.name}](${base}${d.link || '/destinations/' + d.slug}): ${plain(d.short)}`), '');
  L.push('## Key pages', `- [Russia visa](${base}/russia-visa)`, `- [About](${base}/about)`, `- [FAQ](${base}/faq)`, `- [Contact](${base}/contact)`, '');
  L.push('## Contact', [s.address, s.phone && `Phone: ${s.phone}`, s.landline && `Office: ${s.landline}`, s.email && `Email: ${s.email}`, s.hours && `Hours: ${s.hours}`].filter(Boolean).join('\n'), '');
  if (s.disclaimer) L.push('## Note', plain(s.disclaimer), '');
  return L.join('\n');
}