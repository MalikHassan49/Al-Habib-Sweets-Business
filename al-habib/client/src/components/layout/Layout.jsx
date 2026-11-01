import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

export default function Layout() {
  const { settings } = useSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to content</a>
      {settings.announcement && <div className="bg-caramel px-4 py-2 text-center text-sm font-bold text-deep">{settings.announcement}</div>}
      <Navbar />
      <main id="main" className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
