// Runs before every build: creates sitemap.xml and robots.txt from the content.
import fs from 'node:fs';
const c = JSON.parse(fs.readFileSync('content/content.json', 'utf8'));
const base = (c.settings.siteUrl || '').replace(/\/$/, '');
if (base) {
  const urls = ['/', '/about', '/services', '/russia-visa', '/blog', '/faq', '/contact',
    ...c.services.map((s) => `/services/${s.slug}`), ...c.blog.map((b) => `/blog/${b.slug}`)];
  fs.writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${base}/sitemap.xml\n`);
}
