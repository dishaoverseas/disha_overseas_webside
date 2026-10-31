import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ContentProvider, useContent } from './content.jsx';
import { Header, Footer, WhatsAppFloat } from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import { Services, ServiceDetail } from './pages/Services.jsx';
import RussiaVisa from './pages/RussiaVisa.jsx';
import { Blog, BlogPost } from './pages/Blog.jsx';
import { FaqPage, Contact, Legal } from './pages/Misc.jsx';
import NotFound from './pages/NotFound.jsx';

// Brand colours, favicon and so on come from the admin panel
function Theme() {
  const { settings: s } = useContent();
  useEffect(() => {
    const r = document.documentElement.style;
    if (s.primaryColor) r.setProperty('--navy', s.primaryColor);
    if (s.accentColor) r.setProperty('--accent', s.accentColor);
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
