// Describes every editable field. The admin form is generated from this file.
// To add a new editable field to the website: add it here AND to content/content.json AND use it in the site.

export const ICON_NAMES = [
  'Plane', 'Briefcase', 'FileText', 'ShieldCheck', 'Clock', 'Users', 'Globe', 'Phone', 'Mail', 'MapPin', 'CheckCircle2',
  'Star', 'Award', 'HeartHandshake', 'Stamp', 'FileCheck', 'Search', 'Headphones', 'BadgeCheck', 'Compass', 'Landmark',
  'Luggage', 'CreditCard', 'Building2', 'MessageCircle', 'Sparkles', 'Target', 'Eye', 'Lightbulb', 'Handshake',
];

const t = (key, label, o = {}) => ({ key, label, type: 'text', ...o });
const ta = (key, label, o = {}) => ({ key, label, type: 'textarea', rows: 4, ...o });
const img = (key, label, o = {}) => ({ key, label, type: 'image', ...o });
const icon = (key = 'icon', label = 'Icon') => ({ key, label, type: 'icon' });
const strings = (key, label, o = {}) => ({ key, label, type: 'strings', ...o });
const obj = (key, label, fields, o = {}) => ({ key, label, type: 'object', fields, ...o });
const list = (key, label, fields, o = {}) => ({ key, label, type: 'list', fields, ...o });
const link = (key, label) => obj(key, label, [t('label', 'Button text'), t('link', 'Link (for example /contact or https://...)')], { inline: true });

const RICH = 'Tip: leave a blank line between paragraphs. Start a line with "## " for a heading and with "- " for bullet points. Use **text** for bold.';

export const SECTIONS = [
  {
    key: 'settings', label: 'Site settings', group: 'Website', icon: 'Settings',
    help: 'Name, logo, contact details, menu, colours and SEO. These appear on every page.',
    field: {
      type: 'object', fields: [
        t('siteName', 'Business name'),
        t('tagline', 'Short tagline (shown under the name)'),
        img('logo', 'Logo'),
        img('favicon', 'Browser tab icon (square image)'),
        t('siteUrl', 'Website address (needed for the sitemap)', { placeholder: 'https://www.yourdomain.com' }),
        { key: 'primaryColor', label: 'Main colour (navy)', type: 'color' },
        { key: 'accentColor', label: 'Accent colour (red)', type: 'color' },
        t('phone', 'Phone number'),
        t('whatsapp', 'WhatsApp number with country code, digits only', { placeholder: '919876543210' }),
        t('email', 'Email address'),
        ta('address', 'Office address', { rows: 2 }),
        t('hours', 'Working hours'),
        t('topBarText', 'Message in the top bar'),
        list('nav', 'Menu links', [t('label', 'Label'), t('path', 'Page address, for example /about')], { itemTitle: 'label' }),
        t('navCtaLabel', 'Menu button text'),
        t('navCtaLink', 'Menu button link'),
        obj('social', 'Social media links (leave empty to hide)', [
          t('facebook', 'Facebook'), t('instagram', 'Instagram'), t('linkedin', 'LinkedIn'), t('youtube', 'YouTube'), t('twitter', 'X / Twitter'),
        ]),
        ta('footerAbout', 'Footer description'),
        ta('disclaimer', 'Footer disclaimer'),
        t('copyright', 'Copyright text (the year is added automatically)'),
        obj('seo', 'Search engine (SEO) defaults', [
          t('title', 'Home page title'), ta('description', 'Description (about 150 characters)', { rows: 3 }), img('image', 'Share image'),
        ]),
      ],
    },
  },
  {
    key: 'home', label: 'Home page', group: 'Pages', icon: 'Home',
    help: 'Everything shown on the home page.',
    field: {
      type: 'object', fields: [
        obj('hero', 'Top banner', [
          t('badge', 'Small badge text'), ta('title', 'Main heading', { rows: 2 }), ta('subtitle', 'Sub heading'),
          link('primaryBtn', 'Main button'), link('secondaryBtn', 'Second button'),
          img('image', 'Banner background photo (optional)'),
          strings('points', 'Tick points under the buttons'),
          t('finderTitle', 'Country finder box: title'), t('finderText', 'Country finder box: text'),
        ]),
        list('stats', 'Highlight boxes', [t('value', 'Big text'), t('label', 'Small text')], { itemTitle: 'value' }),
        obj('destinationsIntro', 'Destinations section heading (countries are added under "Destinations")', [t('title', 'Title'), ta('subtitle', 'Text', { rows: 2 })]),
        obj('servicesIntro', 'Services section heading', [t('title', 'Title'), ta('subtitle', 'Text', { rows: 2 })]),
        obj('russiaBanner', 'Russia banner', [t('title', 'Title'), ta('text', 'Text'), link('button', 'Button'), img('image', 'Image (optional)')]),
        obj('whyUs', 'Why choose us', [
          t('title', 'Title'), ta('subtitle', 'Text', { rows: 2 }),
          list('items', 'Points', [icon(), t('title', 'Title'), ta('text', 'Text', { rows: 3 })], { itemTitle: 'title' }),
        ]),
        obj('process', 'How it works', [
          t('title', 'Title'), ta('subtitle', 'Text', { rows: 2 }),
          list('steps', 'Steps', [t('title', 'Title'), ta('text', 'Text', { rows: 3 })], { itemTitle: 'title' }),
        ]),
        obj('testimonialsIntro', 'Testimonials heading (testimonials are added under "Testimonials")', [t('title', 'Title'), ta('subtitle', 'Text', { rows: 2 })]),
        obj('faqIntro', 'FAQ heading', [t('title', 'Title'), ta('subtitle', 'Text', { rows: 2 })]),
        obj('cta', 'Bottom call to action', [t('title', 'Title'), ta('text', 'Text', { rows: 2 }), link('button', 'Button')]),
      ],
    },
  },
  {
    key: 'about', label: 'About (company and founder)', group: 'Pages', icon: 'Info',
    help: 'The About page: company story, mission, vision, values and the founder.',
    field: {
      type: 'object', fields: [
        obj('hero', 'Page heading', [t('title', 'Title'), ta('subtitle', 'Sub heading', { rows: 2 })]),
        obj('company', 'Company', [
          t('title', 'Title'), ta('text', 'Company story', { rows: 8, help: RICH }), img('image', 'Photo (office, team, etc.)'),
          ta('mission', 'Mission', { rows: 3 }), ta('vision', 'Vision', { rows: 3 }),
          list('values', 'Values', [icon(), t('title', 'Title'), ta('text', 'Text', { rows: 2 })], { itemTitle: 'title' }),
        ]),
        obj('founder', 'Founder', [
          t('title', 'Section title'), t('name', 'Founder name'), t('role', 'Role'), img('photo', 'Founder photo'),
          ta('bio', 'Founder story', { rows: 8, help: RICH }), ta('quote', 'Quote', { rows: 2 }),
          strings('highlights', 'Highlights (qualifications, experience...)'),
        ]),
      ],
    },
  },
  {
    key: 'russia', label: 'Russia visa page', group: 'Pages', icon: 'Plane',
    help: 'Dedicated page for your Russia specialisation.',
    field: {
      type: 'object', fields: [
        obj('hero', 'Page heading', [t('title', 'Title'), ta('subtitle', 'Sub heading', { rows: 2 }), img('image', 'Background image (optional)')]),
        obj('overview', 'Overview', [t('title', 'Title'), ta('text', 'Text', { rows: 6, help: RICH })]),
        list('visaTypes', 'Visa types', [t('title', 'Title'), ta('text', 'Short text', { rows: 2 }), strings('points', 'What is included')], { itemTitle: 'title' }),
        obj('documents', 'Documents', [t('title', 'Title'), ta('note', 'Note', { rows: 2 }), strings('items', 'Documents')]),
        obj('steps', 'Process', [t('title', 'Title'), list('items', 'Steps', [t('title', 'Title'), ta('text', 'Text', { rows: 2 })], { itemTitle: 'title' })]),
        obj('notes', 'Good to know', [t('title', 'Title'), ta('text', 'Text', { rows: 5, help: RICH })]),
        list('faqs', 'Russia FAQs', [t('q', 'Question'), ta('a', 'Answer', { rows: 3 })], { itemTitle: 'q' }),
      ],
    },
  },
  {
    key: 'services', label: 'Services', group: 'Content', icon: 'Briefcase',
    help: 'Add, edit, reorder or remove services. Each service gets its own page.',
    field: {
      type: 'list', itemTitle: 'title', slugFrom: 'title', fields: [
        t('title', 'Service name'),
        t('slug', 'Page address (auto-filled from the name)', { placeholder: 'leave empty to auto-create' }),
        icon(), ta('short', 'Short description (shown on cards)', { rows: 2 }),
        ta('description', 'Full description', { rows: 8, help: RICH }),
        img('image', 'Image (optional)'),
        strings('features', 'What is included'),
        strings('documents', 'Common documents'),
      ],
    },
  },
  {
    key: 'destinations', label: 'Destinations (countries)', group: 'Content', icon: 'Globe',
    help: 'Add every country you offer visas for. Each country gets its own page. The first 8 are shown on the home page.',
    field: {
      type: 'list', itemTitle: 'name', slugFrom: 'name', fields: [
        t('name', 'Country name'),
        t('slug', 'Page address (auto-filled from the name)', { placeholder: 'leave empty to auto-create' }),
        t('code', 'Two letter country code for the flag', { placeholder: 'ae, th, us, gb...', help: 'Find codes at flagcdn.com/en/codes.html' }),
        t('region', 'Region', { placeholder: 'Asia, Europe, Middle East, Americas, Oceania' }),
        ta('short', 'Short description (shown on cards)', { rows: 2 }),
        ta('description', 'Full description', { rows: 8, help: RICH }),
        img('image', 'Background image for the country page (optional)'),
        t('link', 'Custom page link (optional, for example /russia-visa)'),
        strings('visaTypes', 'Visa types offered'),
        strings('highlights', 'Highlights'),
        strings('documents', 'Common documents'),
      ],
    },
  },
  {
    key: 'blog', label: 'Blog articles', group: 'Content', icon: 'Newspaper',
    help: 'Visa tips and news. Great for Google search traffic.',
    field: {
      type: 'list', itemTitle: 'title', slugFrom: 'title', fields: [
        t('title', 'Title'), t('slug', 'Page address (auto-filled)', { placeholder: 'leave empty to auto-create' }),
        { key: 'date', label: 'Date', type: 'date' }, t('author', 'Author'), ta('excerpt', 'Short summary', { rows: 2 }),
        img('image', 'Cover image'), ta('content', 'Article', { rows: 14, help: RICH }),
      ],
    },
  },
  {
    key: 'faqs', label: 'FAQs', group: 'Content', icon: 'HelpCircle',
    help: 'Questions and answers shown on the FAQ page and the home page.',
    field: { type: 'list', itemTitle: 'q', fields: [t('q', 'Question'), ta('a', 'Answer', { rows: 3 })] },
  },
  {
    key: 'faqPage', label: 'FAQ page heading', group: 'Content', icon: 'HelpCircle',
    field: { type: 'object', fields: [t('title', 'Title'), ta('subtitle', 'Text', { rows: 2 })] },
  },
  {
    key: 'testimonials', label: 'Testimonials', group: 'Content', icon: 'Star',
    help: 'Add real client reviews. The section appears on the home page only when there is at least one.',
    field: {
      type: 'list', itemTitle: 'name', fields: [
        t('name', 'Client name'), t('location', 'City'), t('visa', 'Visa type'),
        { key: 'rating', label: 'Stars (1 to 5)', type: 'number' }, ta('text', 'Review', { rows: 4 }),
      ],
    },
  },
  {
    key: 'contact', label: 'Contact page', group: 'Pages', icon: 'Phone',
    help: 'Phone, email and address come from Site settings.',
    field: {
      type: 'object', fields: [
        t('title', 'Title'), ta('subtitle', 'Sub heading', { rows: 2 }), t('infoTitle', 'Contact details heading'),
        t('formTitle', 'Form heading'), ta('successMessage', 'Message shown after the form is sent', { rows: 2 }),
        t('mapEmbedUrl', 'Google Map embed link', { help: 'On Google Maps: Share > Embed a map > copy only the address inside src="..."' }),
      ],
    },
  },
  {
    key: 'legal', label: 'Privacy and terms', group: 'Pages', icon: 'Scale',
    field: {
      type: 'object', fields: [
        obj('privacy', 'Privacy Policy', [t('title', 'Title'), { key: 'updated', label: 'Last updated', type: 'date' }, ta('content', 'Content', { rows: 14, help: RICH })]),
        obj('terms', 'Terms and Conditions', [t('title', 'Title'), { key: 'updated', label: 'Last updated', type: 'date' }, ta('content', 'Content', { rows: 14, help: RICH })]),
      ],
    },
  },
];

export const slugify = (s = '') =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function blankFor(fields) {
  const o = {};
  for (const f of fields) {
    if (f.type === 'list' || f.type === 'strings') o[f.key] = [];
    else if (f.type === 'object') o[f.key] = blankFor(f.fields);
    else if (f.type === 'number') o[f.key] = 5;
    else o[f.key] = '';
  }
  return o;
}