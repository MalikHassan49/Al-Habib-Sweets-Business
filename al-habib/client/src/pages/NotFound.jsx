import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-7xl text-caramel">404</p>
      <h1 className="mt-2 text-3xl">This page is not on our shelf</h1>
      <p className="mt-2 text-choc/80">The page may have moved, or it is not ready yet.</p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
