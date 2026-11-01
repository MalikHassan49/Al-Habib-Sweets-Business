import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

Object.assign(process.env, { MONGODB_URI: 'mongodb://127.0.0.1:1/unused', JWT_SECRET: 'x'.repeat(40), CLIENT_URL: 'http://localhost:5173' });
const { default: Product } = await import('../src/models/Product.js');
const { default: app } = await import('../src/app.js');

const category = new mongoose.Types.ObjectId();
const wv = (o = {}) => ({ label: '500 g', variantType: 'weight', sizeValue: 500, sizeUnit: 'g', unit: 'g', price: 600, stockQuantity: 5000, lowStockThreshold: 1000, ...o });
const make = (o) => new Product({ name: 'Test', category, ...o });
const rejects = (doc, field) => assert.rejects(() => doc.validate(), (e) => field in e.errors);

test('fixed product: valid, minPrice and status derived', async () => {
  const p = make({ pricingType: 'fixed', price: 150, stockQuantity: 10, lowStockThreshold: 3 });
  await p.validate();
  assert.equal(p.minPrice, 150); assert.equal(p.status, 'in_stock');
});
test('fixed product needs a price and cannot have variants', async () => {
  await rejects(make({ pricingType: 'fixed' }), 'price');
  await rejects(make({ pricingType: 'fixed', price: 1, variants: [wv()] }), 'variants');
});
test('variant pricing types need variants of the right kind', async () => {
  await rejects(make({ pricingType: 'weight' }), 'variants');
  await rejects(make({ pricingType: 'weight', variants: [wv({ unit: 'piece' })] }), 'variants');
  await rejects(make({ pricingType: 'package', variants: [wv()] }), 'variants');
  await rejects(make({ pricingType: 'weight', variants: [wv(), wv()] }), 'variants');
});
test('weight product: price cleared, stock lives on variants, minPrice is the cheapest', async () => {
  const p = make({ pricingType: 'weight', price: 999, stockQuantity: 50, variants: [wv(), wv({ label: '1 kg', sizeValue: 1000, price: 1100 })] });
  await p.validate();
  assert.equal(p.price, undefined); assert.equal(p.stockQuantity, 0); assert.equal(p.minPrice, 600);
});
test('custom pricing never keeps a price (contact-us pricing)', async () => {
  const p = make({ pricingType: 'custom', price: 5 });
  await p.validate();
  assert.equal(p.price, undefined); assert.equal(p.minPrice, undefined);
});
test('stock status per variant and per product', async () => {
  const p = make({ pricingType: 'weight', variants: [wv({ stockQuantity: 0 }), wv({ label: '1 kg', stockQuantity: 800 })] });
  await p.validate();
  assert.deepEqual(p.variants.map((v) => v.status), ['out_of_stock', 'low_stock']);
  assert.equal(p.status, 'low_stock');
});

const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const call = (path, method = 'GET', body, csrf = true) => fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(csrf && { 'X-Requested-With': 'XMLHttpRequest' }) }, body: body && JSON.stringify(body) });
after(() => server.close());

test('API: health, 404, auth wall, CSRF guard, validation', async () => {
  assert.equal((await call('/api/health')).status, 200);
  assert.equal((await call('/api/nope')).status, 404);
  assert.equal((await call('/api/auth/me')).status, 401);
  assert.equal((await call('/api/products', 'POST', { name: 'x' })).status, 401);
  assert.equal((await call('/api/products/abc', 'PUT', {})).status, 401);
  assert.equal((await call('/api/imagekit/auth')).status, 401);
  assert.equal((await call('/api/admin/dashboard/stats')).status, 401);
  assert.equal((await call('/api/auth/logout', 'POST', {}, false)).status, 403);
  assert.equal((await call('/api/auth/login', 'POST', { email: 'bad', password: '' })).status, 422);
  assert.equal((await call('/api/orders/quote', 'POST', { items: [] })).status, 422);
  assert.equal((await call('/api/orders/quote', 'POST', { items: [{ productId: 'nope', qty: 1 }] })).status, 422);
});
