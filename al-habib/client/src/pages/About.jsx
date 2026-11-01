import { Cake, Heart, Leaf, Sparkles, Store, Users } from 'lucide-react';
import Reveal from '../components/common/Reveal.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

// Commitments only. No founding year, awards or history are stated unless the owner adds them in Settings.
const VALUES = [
  [Leaf, 'Freshness', 'We aim to offer sweets and bakery items that are fresh and prepared with care.'],
  [Sparkles, 'Quality', 'Good ingredients and consistent taste are what we work toward in every box.'],
  [Store, 'Traditional sweets', 'Classic mithai such as laddoo, barfi and gulab jamun remain at the heart of what we offer.'],
  [Cake, 'Bakery and cakes', 'From everyday biscuits and bread to cakes for birthdays and special days.'],
  [Users, 'Customer satisfaction', 'We confirm your order details with you directly so you know what to expect.'],
  [Heart, 'Celebrations', 'We love being part of weddings, Eid, birthdays and family gatherings.'],
];

export default function About() {
  const { settings: s } = useSettings();
  usePageTitle('About Us', 'Learn about Al-Habib Sweets & Bakers: our commitment to fresh, quality traditional sweets, bakery items and celebrations.');
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-4xl">About {s.businessName || 'Al-Habib Sweets & Bakers'}</h1>
      <p className="mt-3 max-w-2xl text-lg text-choc/80">{s.description || 'A sweets and bakery shop that brings together traditional mithai and modern bakery favourites for everyday moments and big celebrations.'}</p>
      {s.aboutContent && <div className="card mt-6 whitespace-pre-line p-6">{s.aboutContent}</div>}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {VALUES.map(([Icon, t, d], i) => <Reveal key={t} delay={(i % 3) * 0.08} className="card p-6"><Icon className="text-caramel" /><h2 className="mt-3 text-xl">{t}</h2><p className="mt-1 text-choc/80">{d}</p></Reveal>)}
      </div>
    </div>
  );
}
