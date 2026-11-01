import { Link } from 'react-router-dom';
import { priceLabel } from '../../utils/currency.js';
import { ikUrl } from '../../utils/image.js';

const BADGES = {
  in_stock: ['In stock', 'bg-ok/10 text-ok'],
  low_stock: ['Low stock', 'bg-caramel/20 text-choc'],
  out_of_stock: ['Out of stock', 'bg-bad/10 text-bad'],
  unavailable: ['Unavailable', 'bg-bad/10 text-bad'],
};

export function ImageOrFallback({ src, alt, className = '' }) {
  return src ? (
    <img src={ikUrl(src)} alt={alt} loading="lazy" className={`h-full w-full object-cover ${className}`} />
  ) : (
    <div role="img" aria-label={`${alt} (no photo yet)`} className="flex h-full w-full items-center justify-center bg-beige font-display text-3xl text-choc/50">{alt.slice(0, 1)}</div>
  );
}

export default function ProductCard({ product: p }) {
  const [label, tone] = BADGES[p.status] || BADGES.in_stock;
  return (
    <Link to={`/products/${p.slug}`} className="card group block overflow-hidden transition hover:-translate-y-1 hover:shadow-md">
      <div className="aspect-[4/3] overflow-hidden"><ImageOrFallback src={p.imageUrl} alt={p.name} className="transition duration-500 group-hover:scale-105" /></div>
      <div className="space-y-1 p-4">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${tone}`}>{label}</span>
        <h3 className="text-lg leading-tight">{p.name}</h3>
        <p className="font-bold text-choc">{priceLabel(p)}</p>
      </div>
    </Link>
  );
}

export const ProductSkeletons = ({ n = 4 }) => (
  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true">
    {Array.from({ length: n }, (_, i) => <div key={i} className="card h-60 animate-pulse bg-beige/60" />)}
  </div>
);
