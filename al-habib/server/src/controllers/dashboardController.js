import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const STATUSES = ['in_stock', 'low_stock', 'out_of_stock', 'unavailable'];

async function load() {
  const [products, categories] = await Promise.all([
    Product.find().select('name slug imageUrl category pricingType unit stockQuantity lowStockThreshold isAvailable variants createdAt').sort({ createdAt: -1 }).limit(5000),
    Category.find().sort({ displayOrder: 1, name: 1 }),
  ]);
  return { products, categories };
}
const countStatuses = (products) => {
  const c = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  products.forEach((p) => { c[p.status] += 1; });
  return c;
};

export const stats = asyncHandler(async (_req, res) => {
  const { products, categories } = await load();
  const counts = countStatuses(products);
  const lowStockItems = [];
  for (const p of products) {
    if (p.pricingType === 'fixed') {
      if (p.status === 'low_stock') lowStockItems.push({ productId: p._id, name: p.name, variant: '', quantity: p.stockQuantity, unit: p.unit });
    } else {
      p.variants.filter((v) => v.status === 'low_stock').forEach((v) => lowStockItems.push({ productId: p._id, name: p.name, variant: v.label, quantity: v.stockQuantity, unit: v.unit }));
    }
  }
  res.json({
    success: true,
    data: {
      totalProducts: products.length,
      activeCategories: categories.filter((c) => c.isActive).length,
      available: products.filter((p) => p.isAvailable).length,
      unavailable: products.filter((p) => !p.isAvailable).length,
      outOfStock: counts.out_of_stock,
      lowStockItems,
      recent: products.slice(0, 5).map((p) => ({ id: p._id, name: p.name, slug: p.slug, imageUrl: p.imageUrl, status: p.status, createdAt: p.createdAt })),
    },
  });
});

export const charts = asyncHandler(async (_req, res) => {
  const { products, categories } = await load();
  const per = new Map();
  products.forEach((p) => per.set(String(p.category), (per.get(String(p.category)) || 0) + 1));
  res.json({
    success: true,
    data: {
      productsByCategory: categories.map((c) => ({ name: c.name, count: per.get(String(c._id)) || 0 })),
      inventoryStatus: countStatuses(products),
    },
  });
});
