import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { getAdminProducts, deleteProduct } from '../services/adminService.js';
import { errMsg } from '../services/api.js';
import { formatPKR, priceLabel } from '../utils/currency.js';
import { formatQty } from '../utils/stock.js';

const BASIS = { fixed: 'Fixed price', weight: 'By weight', package: 'By package', variant: 'By size', custom: 'Custom' };
const STATUS = { in_stock: ['In stock', 'bg-ok/10 text-ok'], low_stock: ['Low stock', 'bg-caramel/20 text-choc'], out_of_stock: ['Out of stock', 'bg-bad/10 text-bad'], unavailable: ['Unavailable', 'bg-bad/10 text-bad'] };

export default function AdminProducts() {
  usePageTitle('Products');
  const [q, setQ] = useState('');
  const dq = useDebounce(q);
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [toDelete, setToDelete] = useState(null);
  const { data, loading, error } = useFetch(() => getAdminProducts({ page, limit: 10, q: dq, sort: 'newest' }), [page, dq, version]);

  const confirmDelete = async () => {
    try { await deleteProduct(toDelete._id); toast.success('Product deleted'); setVersion((v) => v + 1); }
    catch (x) { toast.error(errMsg(x)); }
    setToDelete(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-4xl">Products</h1><Link to="/admin/products/new" className="btn-primary"><Plus size={18} /> Add product</Link></div>
      <label className="relative mb-4 block max-w-md"><span className="sr-only">Search products</span><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-choc/60" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by name" className="min-h-[44px] w-full rounded-xl border border-beige bg-white pl-10 pr-3" maxLength={60} /></label>
      {loading ? <p aria-busy="true">Loading…</p> : error ? <p role="alert" className="text-bad">{error}</p> : !data.data.length ? <p className="card p-6 text-choc/70">{dq ? 'No products match your search.' : 'No products yet. Add your first one.'}</p> : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-beige/50 text-sm"><tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Pricing</th><th className="p-3">Variants</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody className="divide-y divide-beige">
                {data.data.map((p) => {
                  const [label, tone] = STATUS[p.status] || STATUS.in_stock;
                  return (
                    <tr key={p._id}>
                      <td className="p-3"><div className="flex items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-beige">{p.imageUrl && <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />}</div><div><p className="font-bold">{p.name}</p><p className="text-xs text-choc/70">{priceLabel(p)}</p></div></div></td>
                      <td className="p-3">{p.category?.name}</td><td className="p-3">{BASIS[p.pricingType]}</td><td className="p-3">{p.variants.length || '-'}</td>
                      <td className="p-3 text-sm">{p.pricingType === 'fixed' ? formatQty(p.stockQuantity, p.unit) : p.variants.length ? p.variants.map((v) => `${v.label}: ${formatQty(v.stockQuantity, v.unit)}`).slice(0, 2).join(', ') + (p.variants.length > 2 ? '…' : '') : '-'}</td>
                      <td className="p-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tone}`}>{label}</span></td>
                      <td className="whitespace-nowrap p-3 text-right"><Link aria-label={`Edit ${p.name}`} to={`/admin/products/${p._id}`} className="inline-block p-2"><Pencil size={18} /></Link><button aria-label={`Delete ${p.name}`} className="p-2 text-bad" onClick={() => setToDelete(p)}><Trash2 size={18} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data.meta.pages > 1 && <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Pagination"><button className="btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {data.meta.pages}</span><button className="btn-outline" disabled={page >= data.meta.pages} onClick={() => setPage(page + 1)}>Next</button></nav>}
        </>
      )}
      <ConfirmDialog open={!!toDelete} title="Delete product?" message={`"${toDelete?.name}" and its variants will be removed. Its images are cleaned up from ImageKit afterwards.`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
