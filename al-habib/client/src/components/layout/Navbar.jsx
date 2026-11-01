import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useOrder } from '../../context/OrderContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

export const NAV = [['/', 'Home'], ['/products', 'Products'], ['/events', 'Event Orders'], ['/about', 'About'], ['/contact', 'Contact']];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();
  const { count } = useOrder();
  const link = ({ isActive }) => `rounded-full px-4 py-2 font-bold ${isActive ? 'bg-beige text-choc' : 'text-deep hover:bg-beige/60'}`;
  return (
    <header className="sticky top-0 z-40 bg-cream/95 shadow-sm ring-1 ring-beige backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-choc">
          <img src={settings.logoUrl || '/favicon.svg'} alt="" className="h-9 w-9 rounded-full object-cover" />
          {settings.businessName || 'Al-Habib Sweets & Bakers'}
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={link}>{label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-1">
        <Link to="/order" className="relative rounded-full p-2" aria-label={`Your order, ${count} item${count === 1 ? '' : 's'}`}>
          <ShoppingBag />{count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-caramel px-1.5 text-xs font-bold text-deep">{count}</span>}
        </Link>
        <button className="rounded-full p-2 md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X /> : <Menu />}
        </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-beige md:hidden" aria-label="Mobile">
            <div className="flex flex-col gap-1 p-3">
              {NAV.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className={link}>{label}</NavLink>)}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
