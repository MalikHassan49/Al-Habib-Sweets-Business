import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';
import { stockStatus } from '../utils/stock.js';

/*
 Canonical units (backend maths never uses kg): weight -> 'g', volume -> 'ml',
 count -> piece | packet | box | bottle. The admin UI converts kg <-> g for display.
 Cake sizes are variants: sizeValue=1, sizeUnit='lb', stock counted in pieces.
*/
export const STOCK_UNITS = ['g', 'ml', 'piece', 'packet', 'box', 'bottle'];
export const PRICING_TYPES = ['fixed', 'weight', 'package', 'variant', 'custom'];

const variantSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 60 },
  sku: { type: String, trim: true, maxlength: 40 },
  variantType: { type: String, enum: ['weight', 'package', 'size'], required: true },
  sizeValue: { type: Number, min: 0 },
  sizeUnit: { type: String, enum: ['g', 'ml', 'lb', 'piece', 'packet', 'box', 'bottle'] },
  price: { type: Number, required: true, min: 0 }, // PKR for one unit of this variant
  unit: { type: String, enum: STOCK_UNITS, required: true }, // unit of stockQuantity
  stockQuantity: { type: Number, required: true, min: 0, default: 0 },
  lowStockThreshold: { type: Number, min: 0, default: 0 },
  isAvailable: { type: Boolean, default: true },
  imageUrl: { type: String, default: '' },
  imageFileId: { type: String, default: '' },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });
variantSchema.virtual('status').get(function () {
  return stockStatus(this);
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120, index: true },
    slug: { type: String, unique: true },
    shortDescription: { type: String, trim: true, maxlength: 200, default: '' },
    description: { type: String, trim: true, maxlength: 3000, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    imageUrl: { type: String, default: '' },
    imageFileId: { type: String, default: '' },
    pricingType: { type: String, enum: PRICING_TYPES, required: true },
    price: { type: Number, min: 0 }, // fixed pricing only
    minPrice: { type: Number, index: true }, // derived, used for price sorting
    currency: { type: String, default: 'PKR' },
    unit: { type: String, enum: STOCK_UNITS, default: 'piece' }, // fixed-price stock unit
    variants: { type: [variantSchema], default: [] },
    stockQuantity: { type: Number, min: 0, default: 0 }, // fixed pricing only
    lowStockThreshold: { type: Number, min: 0, default: 0 },
    isAvailable: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false },
    isSeasonal: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
    isDemo: { type: Boolean, default: false }, // marks seed data
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
productSchema.index({ name: 'text', tags: 'text' });

productSchema.pre('validate', function (next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  const type = this.pricingType;
  const variants = this.variants;

  if (type === 'fixed') {
    if (this.price == null) this.invalidate('price', 'Fixed-price products need a price.');
    if (variants.length) this.invalidate('variants', 'Fixed-price products cannot have variants.');
  } else if (type === 'custom') {
    if (this.price != null) this.invalidate('price', 'Custom-priced products must not have a price.');
  } else if (!variants.length) {
    this.invalidate('variants', `"${type}" pricing needs at least one variant.`);
  }

  if (type !== 'fixed') {
    this.price = undefined;
    this.stockQuantity = 0; // stock lives on variants, so values never contradict
    const labels = variants.map((v) => v.label.toLowerCase());
    if (new Set(labels).size !== labels.length) this.invalidate('variants', 'Variant labels must be unique.');
    const expected = { weight: 'weight', package: 'package', variant: 'size' }[type];
    if (expected && variants.some((v) => v.variantType !== expected)) {
      this.invalidate('variants', `All variants must be of type "${expected}" for "${type}" pricing.`);
    }
    if (type === 'weight' && variants.some((v) => v.unit !== 'g')) {
      this.invalidate('variants', 'Weight variants must store stock in grams (g).');
    }
  }
  this.minPrice = type === 'fixed' ? this.price : type === 'custom' || !variants.length ? undefined : Math.min(...variants.map((v) => v.price));
  next();
});

productSchema.virtual('status').get(function () {
  if (this.pricingType === 'fixed') return stockStatus(this);
  if (!this.isAvailable || !this.variants.length) return 'unavailable';
  const s = this.variants.map((v) => stockStatus(v));
  if (s.includes('in_stock')) return 'in_stock';
  if (s.includes('low_stock')) return 'low_stock';
  return s.every((x) => x === 'unavailable') ? 'unavailable' : 'out_of_stock';
});

export default mongoose.model('Product', productSchema);
