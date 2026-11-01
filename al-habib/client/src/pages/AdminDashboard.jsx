import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { getCharts, getStats } from '../services/adminService.js';
import { formatQty } from '../utils/stock.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);
const LABELS = { in_stock: 'In stock', low_stock: 'Low stock', out_of_stock: 'Out of stock', unavailable: 'Unavailable' };

const Stat = ({ label, value, tone = '' }) => (
  <div className="card p-4"><p className="text-sm text-choc/70">{label}</p><p className={`font-display text-3xl ${tone}`}>{value}</p></div>
);

export default function AdminDashboard() {
  usePageTitle('Dashboard');
  const s = useFetch(getStats, []);
  const c = useFetch(getCharts, []);
  if (s.loading || c.loading) return <p aria-busy="true">Loading dashboard…</p>;
  if (s.error || c.error) return <p role="alert" className="text-bad">Could not load the dashboard: {s.error || c.error}</p>;
  const d = s.data;
  const inv = c.data.inventoryStatus;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl">Overview</h1>
      <p className="text-sm text-choc/70">All numbers come from your catalog. This version has no payments or confirmed orders, so there is no sales data.</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Total products" value={d.totalProducts} />
        <Stat label="Active categories" value={d.activeCategories} />
        <Stat label="Available" value={d.available} tone="text-ok" />
        <Stat label="Unavailable" value={d.unavailable} tone="text-bad" />
        <Stat label="Out of stock" value={d.outOfStock} tone="text-bad" />
        <Stat label="Low-stock items" value={d.lowStockItems.length} tone="text-caramel" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-4"><h2 className="mb-3 text-xl">Products by category</h2>
          {c.data.productsByCategory.length ? (
            <Bar aria-label="Products by category" data={{ labels: c.data.productsByCategory.map((x) => x.name), datasets: [{ data: c.data.productsByCategory.map((x) => x.count), backgroundColor: '#5C3524', borderRadius: 6 }] }} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
          ) : <p className="text-choc/70">Add categories to see this chart.</p>}
        </section>
        <section className="card p-4"><h2 className="mb-3 text-xl">Inventory status</h2>
          {d.totalProducts ? (
            <div className="mx-auto max-w-xs"><Doughnut aria-label="Inventory status" data={{ labels: Object.keys(inv).map((k) => LABELS[k]), datasets: [{ data: Object.values(inv), backgroundColor: ['#25803D', '#B77945', '#C0392B', '#9CA3AF'] }] }} /></div>
          ) : <p className="text-choc/70">Add products to see this chart.</p>}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-4"><h2 className="mb-3 text-xl">Low stock</h2>
          {d.lowStockItems.length ? <ul className="divide-y divide-beige">{d.lowStockItems.map((x, i) => <li key={i} className="flex justify-between py-2"><span>{x.name}{x.variant && ` (${x.variant})`}</span><span className="font-bold text-caramel">{formatQty(x.quantity, x.unit)}</span></li>)}</ul> : <p className="text-choc/70">Nothing is running low.</p>}
        </section>
        <section className="card p-4"><h2 className="mb-3 text-xl">Recently added</h2>
          {d.recent.length ? <ul className="divide-y divide-beige">{d.recent.map((p) => <li key={p.id} className="flex justify-between py-2"><Link className="underline" to={`/products/${p.slug}`}>{p.name}</Link><span className="text-sm text-choc/70">{new Date(p.createdAt).toLocaleDateString('en-PK')}</span></li>)}</ul> : <p className="text-choc/70">No products yet.</p>}
        </section>
      </div>
    </div>
  );
}
