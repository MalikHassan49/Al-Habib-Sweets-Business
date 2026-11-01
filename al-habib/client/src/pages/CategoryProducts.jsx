import { useParams } from 'react-router-dom';
import ProductListing from '../components/products/ProductListing.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { getCategories } from '../services/catalogService.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function CategoryProducts() {
  const { slug } = useParams();
  const { data } = useFetch(getCategories, []);
  const cat = data?.find((c) => c.slug === slug);
  usePageTitle(cat?.name || 'Category');
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl">{cat?.name || 'Category'}</h1>
      {cat?.description && <p className="mt-1 mb-6 text-choc/80">{cat.description}</p>}
      <div className="mt-6"><ProductListing key={slug} categorySlug={slug} /></div>
    </div>
  );
}
