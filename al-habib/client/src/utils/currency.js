export const formatPKR = (n) => `Rs. ${Number(n).toLocaleString('en-PK')}`;

// Price shown on cards; the real price basis and unit are shown on the details page.
export function priceLabel(p) {
  if (p.pricingType === 'custom' || p.minPrice == null) return 'Contact us for pricing';
  return p.pricingType === 'fixed' ? formatPKR(p.price) : `From ${formatPKR(p.minPrice)}`;
}
