import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import CategoryProducts from './pages/CategoryProducts.jsx';
import Order from './pages/Order.jsx';
import EventOrders from './pages/EventOrders.jsx';
import { AdminRoot } from './context/AuthContext.jsx';
const AdminLayout = lazy(() => import('./components/admin/AdminLayout.jsx')); // admin code loads only for admins
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx')); // admin code loads only for admins
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx')); // admin code loads only for admins
const AdminProducts = lazy(() => import('./pages/AdminProducts.jsx')); // admin code loads only for admins
const AdminProductForm = lazy(() => import('./pages/AdminProductForm.jsx')); // admin code loads only for admins
const AdminCategories = lazy(() => import('./pages/AdminCategories.jsx')); // admin code loads only for admins
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
const AdminSettings = lazy(() => import('./pages/AdminSettings.jsx')); // admin code loads only for admins
import NotFound from './pages/NotFound.jsx';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <Suspense fallback={<p className="p-10 text-center" aria-busy="true">Loading…</p>}>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:slug" element={<ProductDetails />} />
        <Route path="category/:slug" element={<CategoryProducts />} />
        <Route path="order" element={<Order />} />
        <Route path="events" element={<EventOrders />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin" element={<AdminRoot />}>
        <Route path="login" element={<AdminLogin />} />
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id" element={<AdminProductForm />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>
    </Routes>
    </Suspense>
  );
}
