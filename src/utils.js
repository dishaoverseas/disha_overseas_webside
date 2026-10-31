import { useEffect } from 'react';
import { useContent } from './content.jsx';

export const waLink = (number = '', text = 'Hello Disha Overseas, I would like to know about visa services.') =>
  `https://wa.me/${String(number).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

export const telLink = (phone = '') => `tel:${String(phone).replace(/[^\d+]/g, '')}`;

export const formatDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

export function useSeo(title, description) {
  const { settings } = useContent();
  useEffect(() => {
    const base = settings.siteName;
    document.title = title ? `${title} | ${base}` : settings.seo?.title || base;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description || settings.seo?.description || '');
    window.scrollTo({ top: 0 });
  }, [title, description, settings]);
}

export const isExternal = (link = '') => /^(https?:|mailto:|tel:)/.test(link);
