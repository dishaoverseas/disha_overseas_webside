import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ContentProvider, useContent } from './content.jsx';
import { Header, Footer, WhatsAppFloat } from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import { Services, ServiceDetail } from './pages/Services.jsx';
import { Destinations, DestinationDetail } from './pages/Destinations.jsx';
import RussiaVisa from './pages/RussiaVisa.jsx';
import { Blog, BlogPost } from './pages/Blog.jsx';
import { FaqPage, Contact, Legal } from './pages/Misc.jsx';
import NotFound from './pages/NotFound.jsx';

const FONTS = {
  classic: { head: "'Playfair Display', Georgia, serif", body: "'Inter', system-ui, sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap' },
  corporate: { head: "'Merriweather', Georgia, serif", body: "'Source Sans 3', system-ui, sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Source+Sans+3:wght@400;500;600;700&display=swap' },
  modern: { head: "'Poppins', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&display=swap' },
  elegant: { head: "'Lora', Georgia, serif", body: "'Nunito Sans', system-ui, sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Nunito+Sans:wght@400;600;700&display=swap' },
  traditional: { head: "'Fraunces', Georgia, serif", body: "'Figtree', system-ui, sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap' },
};

// Brand colours, favicon and so on come from the admin panel
function Theme() {
  const { settings: s } = useContent();
  useEffect(() => {
    const r = document.documentElement.style;
    if (s.primaryColor) r.setProperty('--navy', s.primaryColor);
    if (s.accentColor) r.setProperty('--accent', s.accentColor);
    const f = FONTS[s.fontPreset] || FONTS.classic;
    r.setProperty('--font-head', f.head);
    r.setProperty('--font-body', f.body);
    let link = document.getElementById('font-preset');
    if (!link) { link = document.createElement('link'); link.id = 'font-preset'; link.rel = 'stylesheet'; document.head.appendChild(link); }
    if (link.getAttribute('href') !== f.url) link.setAttribute('href', f.url);
    if (s.favicon) {
      const l = document.querySelector('link[rel="icon"]');
      if (l) l.setAttribute('href', s.favicon);
    }
  }, [s]);
  return null;
}

export default function App() {
  return (
    <ContentProvider>
      <Theme />
      <a href="#main" className="skip">Skip to content</a>
      <Header />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:slug" element={<DestinationDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/russia-visa" element={<RussiaVisa />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<Legal type="privacy" />} />
          <Route path="/terms" element={<Legal type="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppFloat />
    </ContentProvider>
  );
}