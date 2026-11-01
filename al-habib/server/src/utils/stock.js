// Single source of truth for stock status (API, dashboard, admin UI).
export const stockStatus = ({ isAvailable, stockQuantity, lowStockThreshold }) => {
  if (!isAvailable) return 'unavailable';
  if (stockQuantity <= 0) return 'out_of_stock';
  if (stockQuantity <= (lowStockThreshold ?? 0)) return 'low_stock';
  return 'in_stock';
};
