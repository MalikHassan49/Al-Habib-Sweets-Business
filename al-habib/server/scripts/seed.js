// npm run seed             adds demo categories/products that do not exist yet (never overwrites anything)
// npm run seed -- --remove removes ONLY records created by this script (marked isDemo)
// Production needs --force. All sample names, prices and stock are demonstration data.
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { connectDB } from '../src/config/db.js';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';

import dns from "node:dns";

dns.setServers(['8.8.8.8']);

const args = process.argv.slice(2);
if (env.isProd && !args.includes('--force')) { console.error('Refusing to seed in production. Re-run with --force if you really mean it.'); process.exit(1); }

const weight = (g, price, stockKg, lowKg = 1) => ({ label: g >= 1000 ? `${g / 1000} kg` : `${g} g`, variantType: 'weight', sizeValue: g, sizeUnit: 'g', unit: 'g', price, stockQuantity: stockKg * 1000, lowStockThreshold: lowKg * 1000 });
const cake = (lb, price, stock, low = 2) => ({ label: `${lb} lb`, variantType: 'size', sizeValue: lb, sizeUnit: 'lb', unit: 'piece', price, stockQuantity: stock, lowStockThreshold: low });
const pack = (label, price, stock, low = 5) => ({ label, variantType: 'package', unit: 'packet', price, stockQuantity: stock, lowStockThreshold: low });

const CATEGORIES = [
  ['Mithai', 'Traditional sweets (demo category).', 1], ['Cakes & Desserts', 'Cakes, pastries and desserts (demo category).', 2],
  ['Bakery', 'Biscuits, cookies and baked goods (demo category).', 3], ['Snacks', 'Packaged snacks (demo category).', 4],
];
const PRODUCTS = [
  { name: 'Laddoo (Demo)', slug: 'laddoo-demo', category: 'Mithai', pricingType: 'weight', isFeatured: true, shortDescription: 'Sample weight-based mithai.', variants: [weight(250, 450, 8), weight(500, 880, 8), weight(1000, 1700, 8)] },
  { name: 'Gulab Jamun (Demo)', slug: 'gulab-jamun-demo', category: 'Mithai', pricingType: 'weight', isSeasonal: true, shortDescription: 'Sample item with one sold-out size.', variants: [weight(500, 900, 0.8, 1), weight(1000, 1750, 0)] },
  { name: 'Chocolate Cake (Demo)', slug: 'chocolate-cake-demo', category: 'Cakes & Desserts', pricingType: 'variant', isFeatured: true, shortDescription: 'Sample cake with size variants.', variants: [cake(1, 1500, 6), cake(2, 2800, 2), cake(3, 4000, 0)] },
  { name: 'Cupcake (Demo)', slug: 'cupcake-demo', category: 'Cakes & Desserts', pricingType: 'fixed', price: 150, unit: 'piece', stockQuantity: 24, lowStockThreshold: 6, shortDescription: 'Sample fixed-price, piece-based item.' },
  { name: 'Butter Cookies (Demo)', slug: 'butter-cookies-demo', category: 'Bakery', pricingType: 'fixed', isFeatured: true, price: 350, unit: 'packet', stockQuantity: 4, lowStockThreshold: 5, shortDescription: 'Sample item that is low on stock.' },
  { name: 'Potato Chips (Demo)', slug: 'potato-chips-demo', category: 'Snacks', pricingType: 'package', shortDescription: 'Sample packaged snack with pack sizes.', variants: [pack('Small packet', 60, 40), pack('Large packet', 150, 25)] },
  { name: 'Wedding Mithai Box (Demo)', slug: 'wedding-mithai-box-demo', category: 'Mithai', pricingType: 'custom', shortDescription: 'Sample custom-priced item: contact the shop.' },
];

await connectDB();
if (args.includes('--remove')) {
  const p = await Product.deleteMany({ isDemo: true });
  let c = 0;
  for (const cat of await Category.find({ isDemo: true })) if (!(await Product.exists({ category: cat._id }))) { await cat.deleteOne(); c++; }
  console.log(`Removed ${p.deletedCount} demo product(s) and ${c} demo category(ies).`);
} else {
  const ids = {};
  let nc = 0, np = 0;
  for (const [name, description, displayOrder] of CATEGORIES) {
    let cat = await Category.findOne({ name });
    if (!cat) { cat = await Category.create({ name, description, displayOrder, isDemo: true }); nc++; }
    ids[name] = cat._id;
  }
  for (const { category, ...rest } of PRODUCTS) {
    if (await Product.exists({ slug: rest.slug })) continue;
    await Product.create({ ...rest, category: ids[category], isDemo: true }); np++;
  }
  console.log(`Seed done: ${nc} category(ies) and ${np} product(s) added. Existing data was left untouched.`);
}
await mongoose.disconnect();
