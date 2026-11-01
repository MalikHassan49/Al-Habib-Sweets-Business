import { Link } from 'react-router-dom';
import { MapPin, Phone, Clock } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';
import { NAV } from './Navbar.jsx';

export default function Footer() {
  const { settings: s } = useSettings();
  const social = Object.entries(s.socialLinks || {}).filter(([, v]) => v);
  return (
    <footer className="mt-16 bg-deep text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold">{s.businessName || 'Al-Habib Sweets & Bakers'}</p>
          <p className="mt-2 text-sm text-cream/80">{s.description || 'Fresh mithai, cakes and bakery items. Order on WhatsApp and pick up from the shop.'}</p>
        </div>
        <ul className="space-y-1 text-sm">{NAV.map(([to, l]) => <li key={to}><Link className="hover:text-caramel" to={to}>{l}</Link></li>)}</ul>
        <ul className="space-y-2 text-sm">
          {s.address && <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0" />{s.address}</li>}
          {s.contactNumber && <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0" />{s.contactNumber}</li>}
          {s.openingHours && <li className="flex gap-2"><Clock size={16} className="mt-0.5 shrink-0" />{s.openingHours}</li>}
          {social.map(([k, v]) => <li key={k}><a className="capitalize underline" href={v} target="_blank" rel="noreferrer">{k}</a></li>)}
          {!s.address && !s.contactNumber && !s.openingHours && <li className="text-cream/70">Shop details will be added by the owner.</li>}
        </ul>
      </div>
      <p className="border-t border-cream/10 py-4 text-center text-xs text-cream/60">© {new Date().getFullYear()} {s.businessName || 'Al-Habib Sweets & Bakers'}</p>
    </footer>
  );
}
