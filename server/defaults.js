// Default content for newer website features. The server adds anything that is MISSING to your saved
// content when it starts, and never overwrites what you have already edited in the admin panel.
const pts = (country) => [
  `Tourist and business visa assistance for ${country}`,
  'Document checklist and careful review before you apply',
  'Application guidance until submission',
  'Transparent process and fees',
];

export const DEFAULTS = {
  assistant: {
    enabled: 'yes',
    name: 'Disha',
    role: 'Visa assistant',
    avatar: '',
    greeting: 'Hello! I am Disha, your visa assistant. What are you looking for today?',
    placeholder: 'Type what you need, for example Russia',
    fallback: 'Did not find it? Chat with our team on WhatsApp',
    items: [
      { label: 'Russia visa', keywords: 'russia moscow russian', target: '/russia-visa' },
      { label: 'Tourist visa', keywords: 'tourist holiday travel visit trip', target: '/services/tourist-visa' },
      { label: 'Business visa', keywords: 'business meeting conference trade', target: '/services/business-visa' },
      { label: 'Countries we cover', keywords: 'country countries destination dubai uae thailand uk europe', target: '/#countries' },
      { label: 'Our services', keywords: 'service services help', target: '/#services' },
      { label: 'How it works', keywords: 'process steps how', target: '/#process' },
      { label: 'Documents help', keywords: 'document documents papers checklist', target: '/services/documentation-support' },
      { label: 'Client reviews', keywords: 'review reviews testimonial feedback', target: '/#reviews' },
      { label: 'Questions (FAQ)', keywords: 'faq question doubt', target: '/faq' },
      { label: 'About the founder', keywords: 'about founder saroj story', target: '/about' },
      { label: 'Free consultation / Contact us', keywords: 'contact call phone address office consultation', target: '/contact' },
      { label: 'Chat on WhatsApp', keywords: 'whatsapp chat message', target: 'whatsapp' },
    ],
  },

  showcase: {
    title: 'Explore visa destinations',
    subtitle: 'Tell us where you want to go. We guide you step by step, from the first document check to the final submission.',
    moreLabel: 'See all destinations',
    items: [
      { title: 'UAE (Dubai and more)', flag: 'ae', image: '', text: 'A popular choice for holidays, shopping and business visits. We help you prepare the right documents and a complete application.', points: pts('the UAE'), buttonLabel: 'Enquire about UAE', buttonLink: '/destinations/united-arab-emirates' },
      { title: 'Thailand', flag: 'th', image: '', text: 'Beaches, culture and city breaks. We guide you through the visa process so you can plan your trip with confidence.', points: pts('Thailand'), buttonLabel: 'Enquire about Thailand', buttonLink: '/destinations/thailand' },
      { title: 'Schengen (Europe)', flag: 'eu', image: '', text: 'One visa for many European countries. Our team checks every document so your application is complete and well prepared.', points: pts('Schengen countries'), buttonLabel: 'Enquire about Europe', buttonLink: '/destinations/schengen-europe' },
      { title: 'Singapore', flag: 'sg', image: '', text: 'For leisure trips and business meetings. We explain the requirements in simple language and keep you updated.', points: pts('Singapore'), buttonLabel: 'Enquire about Singapore', buttonLink: '/destinations/singapore' },
      { title: 'United Kingdom', flag: 'gb', image: '', text: 'For tourists, family visits and business travel. We help you organise your documents and understand each step.', points: pts('the UK'), buttonLabel: 'Enquire about the UK', buttonLink: '/destinations/united-kingdom' },
    ],
  },

  reviewsBar: {
    show: 'yes',
    eyebrow: 'Client reviews',
    score: '',
    count: '',
    source: 'Google',
    link: '',
  },
};

// copies keys that are missing in `target` from `defaults`, never touches existing values
export function deepFill(target, defaults) {
  let changed = false;
  for (const [k, v] of Object.entries(defaults)) {
    if (!(k in target) || target[k] === undefined || target[k] === null) { target[k] = structuredClone(v); changed = true; }
    else if (v && typeof v === 'object' && !Array.isArray(v) && typeof target[k] === 'object' && !Array.isArray(target[k])) {
      if (deepFill(target[k], v)) changed = true;
    }
  }
  return changed;
}