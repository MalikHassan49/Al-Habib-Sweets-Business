import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageCircle, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useFetch } from '../hooks/useFetch.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { getProduct } from '../services/catalogService.js';
import { useOrder } from '../context/OrderContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { formatPKR } from '../utils/currency.js';
import { BASIS, formatQty, maxQty, selectable } from '../utils/stock.js';
import { waLink } from '../utils/whatsapp.js';
import { ImageOrFallback } from '../components/products/ProductCard.jsx';
import ProductCard from '../components/products/ProductCard.jsx';

export default function ProductDetails() {
  const { slug } = useParams();
  const { data: p, loading, error } = useFetch(() => getProduct(slug), [slug]);
  usePageTitle(p?.name);
  const { add } = useOrder();
  const { settings } = useSettings();
  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);

  if (loading) return <div className="mx-auto h-96 max-w-6xl animate-pulse px-4 py-10" aria-busy="true"><div className="card h-full bg-beige/60" /></div>;
  if (error || !p) return <div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-3xl">Product not found</h1><Link to="/products" className="btn-primary mt-6">Browse products</Link></div>;

  const variants = p.variants || [];
  const v = variants.find((x) => x._id === variantId) || null;
  const custom = p.pricingType === 'custom';
  const needsVariant = variants.length > 0;
  const state = v ? v.status : p.status;
  const max = needsVariant && !v ? 0 : maxQty(p, v);
  const canOrder = !custom && selectable(state) && p.isAvailable && max > 0 && (!needsVariant || v);
  const price = v ? v.price : p.price;
  const unitLabel = v ? v.label : p.unit;
  const inquiry = waLink(settings.whatsappNumber, `${settings.whatsappGreeting || 'Assalam-o-Alaikum!'}\nI would like to ask about the price of: ${p.name}`);

  const addToOrder = () => {
    add({ key: `${p._id}:${v?._id || ''}`, productId: p._id, slug: p.slug, name: p.name, variantId: v?._id || null, variantLabel: v?.label || '', qty, max });
    toast.success(`${p.name}${v ? ` (${v.label})` : ''} added to your order`);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-4 text-sm text-choc/70" aria-label="Breadcrumb"><Link to="/products" className="underline">Products</Link> / {p.category?.name}</nav>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="card aspect-square overflow-hidden"><ImageOrFallback src={p.imageUrl} alt={p.name} /></div>
        <div>
          <Link to={`/category/${p.category?.slug}`} className="text-sm font-bold text-caramel">{p.category?.name}</Link>
          <h1 className="mt-1 text-4xl">{p.name}</h1>
          {p.shortDescription && <p className="mt-2 text-lg text-choc/80">{p.shortDescription}</p>}

          <p className="mt-5 text-3xl font-bold text-choc">{custom ? 'Contact us for pricing' : price != null ? formatPKR(price) : `From ${formatPKR(p.minPrice)}`}</p>
          <p className="text-sm text-choc/70">{BASIS[p.pricingType](p)}</p>

          {needsVariant && (
            <fieldset className="mt-5">
              <legend className="mb-2 font-bold">Select an option</legend>
              <div className="flex flex-wrap gap-2">
                {variants.map((x) => {
                  const ok = selectable(x.status);
                  return (
                    <button key={x._id} type="button" disabled={!ok} aria-pressed={variantId === x._id}
                      onClick={() => { setVariantId(x._id); setQty(1); }}
                      className={`rounded-xl border-2 px-4 py-2 text-left transition ${variantId === x._id ? 'border-choc bg-choc text-cream' : 'border-beige bg-white hover:border-caramel'} disabled:cursor-not-allowed disabled:opacity-50`}>
                      <span className="block font-bold">{x.label}</span>
                      <span className="block text-sm">{ok ? formatPKR(x.price) : 'Not available'}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <p className="mt-4 text-sm" aria-live="polite">
            {state === 'low_stock' && <span className="font-bold text-caramel">Low stock{max > 0 ? `: ${max} left` : ''}. </span>}
            {(state === 'out_of_stock' || state === 'unavailable') && <span className="font-bold text-bad">Currently {state === 'out_of_stock' ? 'out of stock' : 'unavailable'}. </span>}
            {v && selectable(v.status) && <span className="text-choc/70">In stock: {formatQty(v.stockQuantity, v.unit)}</span>}
            {!v && !needsVariant && selectable(p.status) && <span className="text-choc/70">In stock: {formatQty(p.stockQuantity, p.unit)}</span>}
          </p>

          {custom ? (
            inquiry ? <a href={inquiry} target="_blank" rel="noreferrer" className="btn-primary mt-6"><MessageCircle size={18} /> Ask for the price on WhatsApp</a>
              : <p className="mt-6 card p-4 text-choc/80">Please contact the shop for the price. WhatsApp is not set up yet.</p>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border-2 border-beige bg-white" role="group" aria-label="Quantity">
                <button type="button" className="p-3" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(qty - 1)}><Minus size={18} /></button>
                <span className="w-10 text-center font-bold">{qty}</span>
                <button type="button" className="p-3" aria-label="Increase quantity" disabled={!canOrder || qty >= max} onClick={() => setQty(qty + 1)}><Plus size={18} /></button>
              </div>
              <button type="button" className="btn-primary disabled:opacity-50" disabled={!canOrder} onClick={addToOrder}><ShoppingBag size={18} /> {needsVariant && !v ? 'Select an option' : 'Add to order'}</button>
            </div>
          )}
          {canOrder && <p className="mt-2 text-sm text-choc/70">Estimated: {formatPKR(price * qty)} for {qty} × {unitLabel}. The shop confirms availability and the final price.</p>}
          {p.description && <p className="mt-6 whitespace-pre-line text-choc/90">{p.description}</p>}
        </div>
      </div>

      {p.related?.length > 0 && (
        <section className="mt-14"><h2 className="mb-4 text-2xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{p.related.map((r) => <ProductCard key={r._id} product={r} />)}</div>
        </section>
      )}
    </div>
  );
}
