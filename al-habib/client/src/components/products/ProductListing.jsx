import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, PackageOpen } from 'lucide-react';
import ProductCard, { ProductSkeletons } from './ProductCard.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { getCategories, getProducts } from '../../services/catalogService.js';

const field = 'min-h-[44px] rounded-xl border border-beige bg-white px-3 focus:border-caramel';

// Shared by /products and /category/:slug. Filters live in the URL so pages can be shared and the back button works.
export default function ProductListing({ categorySlug }) {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const dq = useDebounce(q);
  const category = categorySlug || sp.get('category') || '';
  const availability = sp.get('availability') || '';
  const sort = sp.get('sort') || 'newest';
  const page = Math.max(1, Number(sp.get('page')) || 1);

  const update = (k, v) => setSp((cur) => {
    const n = new URLSearchParams(cur);
    v ? n.set(k, v) : n.delete(k);
    if (k !== 'page') n.delete('page');
    return n;
  }, { replace: true });
  useEffect(() => { if ((sp.get('q') || '') !== dq) update('q', dq); }, [dq]); // eslint-disable-line react-hooks/exhaustive-deps

  const cats = useFetch(getCategories, []);
  const { data, loading, error } = useFetch(
    () => getProducts({ page, limit: 12, q: dq, category, availability, sort }),
    [page, dq, category, availability, sort]
  );

  return (
    <div>
      <div className="card mb-6 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto]" role="search">
        <label className="relative block">
          <span className="sr-only">Search products</span>
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-choc/60" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by product name" className={`${field} w-full pl-10`} maxLength={60} />
        </label>
        {!categorySlug && (
          <select aria-label="Category" value={category} onChange={(e) => update('category', e.target.value)} className={field}>
            <option value="">All categories</option>
            {cats.data?.map((c) => <option key={c._id} value={c.slug}>{c.name}</option>)}
          </select>
        )}
        <select aria-label="Availability" value={availability} onChange={(e) => update('availability', e.target.value)} className={field}>
          <option value="">Any availability</option><option value="in_stock">In stock</option><option value="unavailable">Unavailable</option>
        </select>
        <select aria-label="Sort" value={sort} onChange={(e) => update('sort', e.target.value)} className={field}>
          <option value="newest">Newest</option><option value="name">Name A-Z</option>
          <option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {loading ? <ProductSkeletons n={8} /> : error ? (
        <p role="alert" className="card p-6 text-bad">Could not load products: {error}</p>
      ) : !data.data.length ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center"><PackageOpen className="text-caramel" size={36} /><p className="text-lg font-bold">No products found</p><p className="text-choc/70">Try a different search or filter.</p></div>
      ) : (
        <>
          <p className="mb-3 text-sm text-choc/70" aria-live="polite">{data.meta.total} product{data.meta.total === 1 ? '' : 's'}</p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{data.data.map((p) => <ProductCard key={p._id} product={p} />)}</div>
          {data.meta.pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-4" aria-label="Pagination">
              <button className="btn-outline" disabled={page <= 1} onClick={() => update('page', String(page - 1))}>Previous</button>
              <span>Page {page} of {data.meta.pages}</span>
              <button className="btn-outline" disabled={page >= data.meta.pages} onClick={() => update('page', String(page + 1))}>Next</button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
