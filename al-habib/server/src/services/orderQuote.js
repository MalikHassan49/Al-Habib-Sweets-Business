import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { stockStatus } from '../utils/stock.js';

// Weight variants hold stock in grams, so 10 kg of stock allows twenty 500 g units.
const maxQty = (p, v) => Math.floor(!v ? p.stockQuantity : v.variantType === 'weight' && v.sizeValue ? v.stockQuantity / v.sizeValue : v.stockQuantity);
const orderable = (s) => s === 'in_stock' || s === 'low_stock';

// Prices and stock always come from the database. Nothing from the browser is trusted but ids and quantities.
export async function quoteOrder(items) {
  const ids = [...new Set(items.map((i) => i.productId))];
  const activeCats = await Category.find({ isActive: true }).distinct('_id');
  const products = await Product.find({ _id: { $in: ids }, category: { $in: activeCats } });
  const byId = new Map(products.map((p) => [String(p._id), p]));
  let total = 0;
  let hasUnpriced = false;

  const lines = items.map(({ productId, variantId, qty }) => {
    const base = { productId, variantId: variantId || null, qty };
    const p = byId.get(productId);
    if (!p) return { ...base, name: 'Unknown product', ok: false, problem: 'This product is no longer available.' };
    const v = variantId ? p.variants.id(variantId) : null;
    const line = { ...base, name: p.name, variantLabel: v?.label || '' };
    if (variantId && !v) return { ...line, ok: false, problem: 'This option no longer exists.' };
    if (!variantId && p.variants.length) return { ...line, ok: false, problem: 'Please choose an option.' };
    if (p.pricingType === 'custom') { hasUnpriced = true; return { ...line, ok: true, unitPrice: null, lineTotal: null }; }
    if (!p.isAvailable || !orderable(stockStatus(v || p))) return { ...line, ok: false, problem: 'Currently unavailable.' };
    const max = maxQty(p, v);
    if (qty > max) return { ...line, ok: false, maxQty: max, problem: `Only ${max} available.` };
    const unitPrice = v ? v.price : p.price;
    total += unitPrice * qty;
    return { ...line, ok: true, unitPrice, lineTotal: unitPrice * qty, maxQty: max };
  });
  return { lines, total, hasUnpriced };
}
