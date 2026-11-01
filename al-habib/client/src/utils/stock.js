// Display helpers. Backend stores weight in grams; people see kg once it is 1000 g or more.
export const formatQty = (n, unit) => {
  if (unit === 'g') return n >= 1000 ? `${+(n / 1000).toFixed(2)} kg` : `${n} g`;
  if (unit === 'ml') return n >= 1000 ? `${+(n / 1000).toFixed(2)} L` : `${n} ml`;
  return `${n} ${unit}${n === 1 ? '' : 's'}`;
};
export const selectable = (status) => status === 'in_stock' || status === 'low_stock';

// How many of the chosen option can be ordered (weight variants hold stock in grams).
export const maxQty = (p, v) => {
  if (!v) return Math.floor(p.stockQuantity);
  return Math.floor(v.variantType === 'weight' && v.sizeValue ? v.stockQuantity / v.sizeValue : v.stockQuantity);
};
export const BASIS = {
  fixed: (p) => `Price per ${p.unit === 'g' ? 'gram' : p.unit}`,
  weight: () => 'Choose a weight. Each price is for that weight.',
  package: () => 'Choose a pack size. Each price is for one pack.',
  variant: () => 'Choose a size. Each price is for one cake or item of that size.',
  custom: () => 'Price is confirmed by the shop.',
};
