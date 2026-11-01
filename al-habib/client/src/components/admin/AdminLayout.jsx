import { useState } from 'react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, Settings, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const LINKS = [['/admin', 'Overview', LayoutDashboard, true], ['/admin/products', 'Products', Package], ['/admin/categories', 'Categories', FolderTree], ['/admin/settings', 'Settings', Settings]];

export default function AdminLayout() {
  const { admin, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (loading) return <p className="p-10 text-center" aria-busy="true">Loading…</p>;
  if (!admin) return <Navigate to="/admin/login" replace />;
  const cls = ({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 font-bold ${isActive ? 'bg-caramel text-deep' : 'text-cream hover:bg-choc'}`;
  return (
    <div className="min-h-screen md:flex">
      <header className="flex items-center justify-between bg-deep p-3 text-cream md:hidden">
        <span className="font-display text-lg">Admin</span>
        <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
      </header>
      <aside className={`${open ? 'block' : 'hidden'} w-full shrink-0 bg-deep p-4 md:block md:w-64`}>
        <p className="mb-6 hidden font-display text-xl text-cream md:block">Al-Habib Admin</p>
        <nav className="space-y-1" aria-label="Admin">
          {LINKS.map(([to, label, Icon, end]) => <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={cls}><Icon size={18} />{label}</NavLink>)}
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-4 py-3 text-cream hover:bg-choc"><ExternalLink size={18} />View website</a>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-cream hover:bg-choc"><LogOut size={18} />Log out</button>
        </nav>
        <p className="mt-6 truncate text-xs text-cream/60">{admin.email}</p>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8"><Outlet /></main>
    </div>
  );
}
