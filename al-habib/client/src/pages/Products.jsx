import ProductListing from '../components/products/ProductListing.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function Products() {
  usePageTitle('All Products');
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-4xl">All Products</h1>
      <ProductListing />
    </div>
  );
}
