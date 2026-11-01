import { Link } from 'react-router-dom';
import { ImageOrFallback } from '../products/ProductCard.jsx';

export default function CategoryCard({ category: c }) {
  return (
    <Link to={`/category/${c.slug}`} className="card group flex items-center gap-4 p-3 transition hover:shadow-md">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl"><ImageOrFallback src={c.imageUrl} alt={c.name} /></div>
      <div className="min-w-0"><h3 className="truncate text-lg">{c.name}</h3><p className="text-sm text-choc/70">{c.productCount} item{c.productCount === 1 ? '' : 's'}</p></div>
    </Link>
  );
}
