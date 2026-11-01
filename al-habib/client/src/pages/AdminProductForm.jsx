import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import Field from '../components/common/Field.jsx';
import ImageUploader from '../components/admin/ImageUploader.jsx';
import VariantRow from '../components/admin/VariantRow.jsx';
import { useImageField } from '../hooks/useImageField.js';
import { useFetch } from '../hooks/useFetch.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { getCategories } from '../services/catalogService.js';
import { getProductById, saveProduct } from '../services/adminService.js';
import { errMsg } from '../services/api.js';
import { formatQty } from '../utils/stock.js';

const VTYPE = { weight: 'weight', package: 'package', variant: 'size' };
const PRICING = [['fixed', 'Fixed price (one price per item)'], ['weight', 'By weight (250 g, 500 g, 1 kg...)'], ['package', 'By package (packets, boxes, bottles)'], ['variant', 'By size (cake sizes etc.)'], ['custom', 'Custom (contact us for pricing)']];
const rid = () => Math.random().toString(36).slice(2);
const kg = (n) => (n == null ? '' : n / 1000);

const blankVariant = (type) => ({ key: rid(), label: '', sku: '', sizeValue: '', sizeUnit: type === 'variant' ? 'lb' : '', price: '', stock: '', low: '0', unit: type === 'weight' ? 'g' : type === 'variant' ? 'piece' : 'packet', isAvailable: true, imageUrl: '', imageFileId: '' });
const fromVariant = (v, type) => ({ key: v._id, _id: v._id, label: v.label, sku: v.sku || '', sizeValue: v.sizeValue ?? '', sizeUnit: v.sizeUnit || '', price: v.price, stock: type === 'weight' ? kg(v.stockQuantity) : v.stockQuantity, low: type === 'weight' ? kg(v.lowStockThreshold) : v.lowStockThreshold, unit: v.unit, isAvailable: v.isAvailable, imageUrl: v.imageUrl || '', imageFileId: v.imageFileId || '' });
// Admin sees kilograms for weight stock; the server always stores grams.
const toVariant = (v, type) => {
  const n = Number;
  const w = type === 'weight';
  return {
    ...(v._id && { _id: v._id }),
    label: v.label.trim() || (w ? formatQty(n(v.sizeValue), 'g') : ''),
    sku: v.sku.trim() || undefined, variantType: VTYPE[type],
    sizeValue: v.sizeValue === '' ? undefined : n(v.sizeValue), sizeUnit: w ? 'g' : v.sizeUnit || undefined,
    unit: w ? 'g' : v.unit, price: n(v.price),
    stockQuantity: w ? Math.round(n(v.stock) * 1000) : n(v.stock), lowStockThreshold: w ? Math.round(n(v.low) * 1000) : n(v.low || 0),
    isAvailable: v.isAvailable, imageUrl: v.imageUrl, imageFileId: v.imageFileId,
  };
};

function Form({ product, categories }) {
  const nav = useNavigate();
  const p = product;
  const [f, setF] = useState({
    name: p?.name || '', slug: p?.slug || '', shortDescription: p?.shortDescription || '', description: p?.description || '',
    category: p?.category?._id || '', pricingType: p?.pricingType || 'fixed', price: p?.price ?? '', unit: p?.unit || 'piece',
    stockQuantity: p?.stockQuantity ?? '', lowStockThreshold: p?.lowStockThreshold ?? 0, tags: (p?.tags || []).join(', '),
    isAvailable: p?.isAvailable ?? true, isFeatured: p?.isFeatured ?? false, isSeasonal: p?.isSeasonal ?? false,
  });
  const [variants, setVariants] = useState((p?.variants || []).map((v) => fromVariant(v, p.pricingType)));
  const img = useImageField({ url: p?.imageUrl || '', fileId: p?.imageFileId || '' });
  const registry = useRef(new Map());
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const type = f.pricingType;
  const usesVariants = ['weight', 'package', 'variant'].includes(type);

  const changeType = (e) => {
    const next = e.target.value;
    if (variants.length && next !== type) { setVariants([]); toast('Variants were cleared because the pricing type changed.'); }
    setF((s) => ({ ...s, pricingType: next }));
  };
  const patchVariant = (key, patch) => setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  const num = (x) => x !== '' && !Number.isNaN(Number(x)) && Number(x) >= 0;

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = 'Name must be at least 2 characters.';
    if (!f.category) er.category = 'Choose a category.';
    if (type === 'fixed') { if (!num(f.price)) er.price = 'Enter a price.'; if (!num(f.stockQuantity)) er.stockQuantity = 'Enter the stock quantity (0 if none).'; }
    if (usesVariants) {
      if (!variants.length) er.variants = 'Add at least one variant.';
      else if (variants.some((v) => !num(v.price) || !num(v.stock) || (type === 'weight' && !(Number(v.sizeValue) > 0)) || (type !== 'weight' && !v.label.trim()))) er.variants = 'Every variant needs a label (weight for weight options), a price and a stock quantity.';
    }
    setErrors(er);
    if (Object.keys(er).length) return toast.error('Please fix the highlighted fields.');

    const body = {
      name: f.name.trim(), shortDescription: f.shortDescription.trim(), description: f.description.trim(), category: f.category, pricingType: type,
      isAvailable: f.isAvailable, isFeatured: f.isFeatured, isSeasonal: f.isSeasonal,
      tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean), imageUrl: img.image.url, imageFileId: img.image.fileId,
      price: type === 'fixed' ? Number(f.price) : null, variants: usesVariants ? variants.map((v) => toVariant(v, type)) : [],
    };
    if (f.slug.trim()) body.slug = f.slug.trim();
    if (type === 'fixed') Object.assign(body, { unit: f.unit, stockQuantity: Number(f.stockQuantity), lowStockThreshold: Number(f.lowStockThreshold) || 0 });
    setBusy(true);
    try {
      await saveProduct(p?._id, body);
      img.committed();
      registry.current.forEach((r) => r.committed());
      toast.success(p ? 'Product updated' : 'Product created');
      nav('/admin/products');
    } catch (x) { toast.error(errMsg(x)); } finally { setBusy(false); }
  };
  const cancel = () => { img.abandon(); registry.current.forEach((r) => r.abandon()); nav('/admin/products'); };
  const check = (k, label) => <label className="flex items-center gap-2 font-bold"><input type="checkbox" className="h-5 w-5" checked={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} /> {label}</label>;

  return (
    <form onSubmit={submit} noValidate className="space-y-8">
      <section className="card space-y-4 p-5">
        <h2 className="text-2xl">Product details <span className="text-sm font-normal text-choc/70">(applies to the whole product)</span></h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" error={errors.name}><input value={f.name} onChange={set('name')} maxLength={120} /></Field>
          <Field label="Slug (optional)" hint="Web address part. Leave empty to generate it."><input value={f.slug} onChange={set('slug')} maxLength={120} /></Field>
          <Field label="Category" error={errors.category}><select value={f.category} onChange={set('category')}><option value="">Select…</option>{categories.map((c) => <option key={c._id} value={c._id}>{c.name}{c.isActive ? '' : ' (disabled)'}</option>)}</select></Field>
          <Field label="Pricing type"><select value={type} onChange={changeType}>{PRICING.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          <div className="md:col-span-2"><Field label="Short description"><input value={f.shortDescription} onChange={set('shortDescription')} maxLength={200} /></Field></div>
          <div className="md:col-span-2"><Field label="Full description"><textarea rows={4} value={f.description} onChange={set('description')} maxLength={3000} /></Field></div>
          <Field label="Tags" hint="Separate with commas"><input value={f.tags} onChange={set('tags')} /></Field>
        </div>
        {type === 'fixed' && (
          <div className="grid gap-4 rounded-xl bg-cream p-4 md:grid-cols-4">
            <Field label="Price (Rs.)" error={errors.price}><input type="number" min="0" value={f.price} onChange={set('price')} /></Field>
            <Field label="Sold per"><select value={f.unit} onChange={set('unit')}>{['piece', 'packet', 'box', 'bottle'].map((u) => <option key={u}>{u}</option>)}</select></Field>
            <Field label="Stock quantity" error={errors.stockQuantity}><input type="number" min="0" value={f.stockQuantity} onChange={set('stockQuantity')} /></Field>
            <Field label="Low-stock alert"><input type="number" min="0" value={f.lowStockThreshold} onChange={set('lowStockThreshold')} /></Field>
          </div>
        )}
        {type === 'custom' && <p className="rounded-xl bg-cream p-4 text-sm">Customers will see "Contact us for pricing" and can ask for the price on WhatsApp. No price or stock is needed.</p>}
        <ImageUploader field={img} label="Product image" />
        <div className="flex flex-wrap gap-6">{check('isAvailable', 'Available')}{check('isFeatured', 'Featured')}{check('isSeasonal', 'Seasonal')}</div>
      </section>

      {usesVariants && (
        <section className="card space-y-4 border-2 border-caramel/40 p-5">
          <h2 className="text-2xl">Variants <span className="text-sm font-normal text-choc/70">(each has its own price and stock)</span></h2>
          {errors.variants && <p role="alert" className="text-sm text-bad">{errors.variants}</p>}
          {variants.map((v, i) => <VariantRow key={v.key} v={v} type={type} index={i} registry={registry} onChange={(patch) => patchVariant(v.key, patch)} onRemove={() => setVariants((vs) => vs.filter((x) => x.key !== v.key))} />)}
          <button type="button" className="btn-outline" onClick={() => setVariants((vs) => [...vs, blankVariant(type)])}><Plus size={18} /> Add variant</button>
        </section>
      )}

      <div className="flex gap-3">
        <button className="btn-primary disabled:opacity-50" disabled={busy || img.uploading}>{busy ? 'Saving…' : 'Save product'}</button>
        <button type="button" className="btn-outline" onClick={cancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function AdminProductForm() {
  const { id } = useParams();
  usePageTitle(id ? 'Edit Product' : 'New Product');
  const cats = useFetch(getCategories, []);
  const prod = useFetch(() => (id ? getProductById(id) : Promise.resolve(null)), [id]);
  return (
    <div>
      <Link to="/admin/products" className="text-sm font-bold underline">← Back to products</Link>
      <h1 className="mb-6 mt-2 text-4xl">{id ? 'Edit product' : 'New product'}</h1>
      {cats.loading || prod.loading ? <p aria-busy="true">Loading…</p> : cats.error || prod.error ? <p role="alert" className="text-bad">{cats.error || prod.error}</p> : !cats.data.length ? (
        <p className="card p-6">Create a category first, then add products. <Link to="/admin/categories" className="font-bold underline">Go to categories</Link></p>
      ) : <Form key={id || 'new'} product={prod.data} categories={cats.data} />}
    </div>
  );
}
