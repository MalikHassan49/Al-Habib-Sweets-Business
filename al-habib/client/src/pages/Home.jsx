import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageCircle, ShoppingBag, Sparkles, Leaf, HeartHandshake, Cake } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import Reveal from '../components/common/Reveal.jsx';
import { Laddoo, Jalebi, Sparkle, Float } from '../components/common/Sweets.jsx';
import ProductCard, { ProductSkeletons } from '../components/products/ProductCard.jsx';
import CategoryCard from '../components/categories/CategoryCard.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { getCategories, getFeatured, getProducts } from '../services/catalogService.js';
import { waLink } from '../utils/whatsapp.js';

function Section({ title, subtitle, to, children }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <Reveal className="mb-6 flex items-end justify-between gap-4">
        <div><h2 className="text-3xl">{title}</h2>{subtitle && <p className="text-choc/70">{subtitle}</p>}</div>
        {to && <Link to={to} className="shrink-0 font-bold text-choc underline">View all</Link>}
      </Reveal>
      {children}
    </section>
  );
}

// Hides itself when the shop has no matching products, so the home page never shows empty shelves.
function ProductRow({ title, params, to }) {
  const { data, loading } = useFetch(() => getProducts({ limit: 4, ...params }), [JSON.stringify(params)]);
  if (!loading && !data?.data?.length) return null;
  return (
    <Section title={title} to={to}>
      {loading ? <ProductSkeletons /> : <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{data.data.map((p) => <ProductCard key={p._id} product={p} />)}</div>}
    </Section>
  );
}

const WHY = [[Leaf, 'Freshly made', 'Prepared fresh so every box tastes the way it should.'], [HeartHandshake, 'Traditional taste', 'Classic mithai and bakery favourites for every occasion.'], [Cake, 'Made for celebrations', 'Cakes, mithai boxes and event orders for your special days.']];
const STEPS = ['Browse the products and pick your items.', 'Build your order and open WhatsApp.', 'The shop confirms availability and the final price.', 'Collect your order from the shop.'];

export default function Home() {
  const reduce = useReducedMotion();
  const { settings: s } = useSettings();
  const cats = useFetch(getCategories, []);
  const featured = useFetch(getFeatured, []);
  const wa = waLink(s.whatsappNumber, s.whatsappGreeting);
  const orderOnWhatsApp = (e) => { if (!wa) { e.preventDefault(); toast('WhatsApp number is not set up yet. Please check back soon.'); } };

  return (
    <>
      <section className="relative overflow-hidden bg-beige/50">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <motion.div initial={reduce ? false : { opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-bold text-choc ring-1 ring-beige"><Sparkles size={16} /> Fresh · Traditional · Celebratory</p>
            <h1 className="text-4xl leading-tight md:text-6xl">Sweet Moments, Freshly Baked</h1>
            <p className="mt-4 max-w-lg text-lg text-choc/80">{s.description || `Welcome to ${s.businessName || 'Al-Habib Sweets & Bakers'}. Browse our mithai, cakes and bakery items, then prepare your pickup order on WhatsApp.`}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary"><ShoppingBag size={18} /> Explore Our Products</Link>
              <a href={wa || '#'} target="_blank" rel="noreferrer" onClick={orderOnWhatsApp} className="btn-outline"><MessageCircle size={18} /> Order on WhatsApp</a>
            </div>
          </motion.div>
          <div className="relative mx-auto h-72 w-72 md:h-96 md:w-96" aria-hidden="true">
            <div className="absolute inset-6 rounded-full bg-caramel/20" />
            <Float className="absolute left-4 top-6"><Laddoo size={130} /></Float>
            <Float className="absolute bottom-8 right-2" delay={1.2} duration={6}><Jalebi size={150} /></Float>
            <Float className="absolute bottom-16 left-10" delay={0.6} y={8}><Laddoo size={70} /></Float>
            <Float className="absolute right-16 top-4" delay={0.3} y={6} duration={3.5}><Sparkle /></Float>
            <Float className="absolute left-1/2 top-1/2" delay={1.8} y={6} duration={4}><Sparkle size={16} /></Float>
          </div>
        </div>
      </section>

      <Section title="Shop by Category" to="/products">
        {cats.loading ? <ProductSkeletons n={3} /> : cats.data?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cats.data.map((c) => <CategoryCard key={c._id} category={c} />)}</div>
        ) : <p className="card p-6 text-choc/70">Categories will appear here once the shop adds them.</p>}
      </Section>

      <Section title="Popular Products" subtitle="Customer favourites" to="/products">
        {featured.loading ? <ProductSkeletons /> : featured.data?.length ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{featured.data.map((p) => <ProductCard key={p._id} product={p} />)}</div>
        ) : <p className="card p-6 text-choc/70">Our products will be listed here soon.</p>}
      </Section>

      <ProductRow title="Mithai Collection" params={{ category: 'mithai' }} to="/category/mithai" />
      <ProductRow title="Freshly Baked Favorites" params={{ category: 'bakery' }} to="/category/bakery" />
      <ProductRow title="Cakes & Celebrations" params={{ category: 'cakes-desserts' }} to="/category/cakes-desserts" />
      <ProductRow title="Seasonal Specials" params={{ seasonal: 'true' }} />

      <Section title="Wedding & Event Orders">
        <Reveal className="card flex flex-col items-start gap-4 bg-choc p-8 text-cream md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-lg">Planning a wedding, Eid gathering, or a big family event? Send us your requirements and the shop will confirm the details and price with you.</p>
          <Link to="/events" className="btn bg-caramel text-deep hover:bg-beige">Send an event inquiry</Link>
        </Reveal>
      </Section>

      <Section title="Why Choose Al-Habib?">
        <div className="grid gap-4 md:grid-cols-3">
          {WHY.map(([Icon, t, d], i) => <Reveal key={t} delay={i * 0.1} className="card p-6"><Icon className="text-caramel" /><h3 className="mt-3 text-xl">{t}</h3><p className="mt-1 text-choc/80">{d}</p></Reveal>)}
        </div>
      </Section>

      <Section title="How to Order">
        <ol className="grid gap-4 md:grid-cols-4">
          {STEPS.map((t, i) => <Reveal key={t} delay={i * 0.08}><li className="card h-full list-none p-5"><span className="font-display text-3xl text-caramel">{i + 1}</span><p className="mt-1">{t}</p></li></Reveal>)}
        </ol>
        <p className="mt-3 text-sm text-choc/70">Opening WhatsApp does not confirm or reserve an order. The shop confirms availability and the final price. Pickup only, no online payment.</p>
      </Section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <Reveal className="card flex flex-col items-center gap-3 p-8 text-center">
          <h2 className="text-3xl">Ready to order?</h2>
          <p className="max-w-lg text-choc/80">Tell us what you need on WhatsApp and collect it from the shop.</p>
          <a href={wa || '#'} target="_blank" rel="noreferrer" onClick={orderOnWhatsApp} className="btn-primary"><MessageCircle size={18} /> Order on WhatsApp</a>
          {(s.address || s.openingHours) && <p className="mt-2 text-sm text-choc/80">{[s.address, s.openingHours].filter(Boolean).join(' · ')}</p>}
        </Reveal>
      </section>
    </>
  );
}
