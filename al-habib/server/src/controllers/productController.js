import Product from '../models/Product.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick, str, escapeRegex, uniqueSlug } from '../utils/helpers.js';
import { queueImageCleanup, productFileIds } from '../services/imageCleanup.js';

const FIELDS = ['name', 'slug', 'shortDescription', 'description', 'category', 'imageUrl', 'imageFileId', 'pricingType', 'price', 'currency', 'unit', 'variants', 'stockQuantity', 'lowStockThreshold', 'isAvailable', 'isFeatured', 'isSeasonal', 'tags'];
const SORTS = { newest: { createdAt: -1 }, name: { name: 1 }, price_asc: { minPrice: 1, name: 1 }, price_desc: { minPrice: -1, name: 1 } };

// Public output never includes ImageKit file IDs or demo flags.
const present = (req, p) => {
  const o = p.toJSON();
  if (!req.admin) {
    delete o.imageFileId;
    delete o.isDemo;
    o.variants?.forEach((v) => delete v.imageFileId);
  }
  return o;
};

const visibleFilter = async (req) => (req.admin ? {} : { category: { $in: await Category.find({ isActive: true }).distinct('_id') } });

const query = async (req, filter, { sort, page, limit }) => {
  const [items, total] = await Promise.all([
    Product.find(filter).populate('category', 'name slug').sort(sort).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  return { data: items.map((p) => present(req, p)), meta: { page, limit, total, pages: Math.ceil(total / limit) } };
};

export const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(str(req.query.page)) || 1);
  const limit = Math.min(48, Math.max(1, parseInt(str(req.query.limit)) || 12));
  const filter = await visibleFilter(req);

  const cat = str(req.query.category);
  if (cat) {
    const c = await Category.findOne(mongoose.isValidObjectId(cat) ? { _id: cat } : { slug: cat });
    filter.category = c && (c.isActive || req.admin) ? c._id : { $in: [] };
  }
  const q = str(req.query.q).slice(0, 60);
  if (q) filter.name = { $regex: escapeRegex(q), $options: 'i' };

  const availability = str(req.query.availability);
  if (availability === 'in_stock') {
    filter.isAvailable = true;
    filter.$or = [
      { pricingType: 'fixed', stockQuantity: { $gt: 0 } },
      { pricingType: 'custom' },
      { variants: { $elemMatch: { isAvailable: true, stockQuantity: { $gt: 0 } } } },
    ];
  } else if (availability === 'unavailable') filter.isAvailable = false;
  if (str(req.query.featured) === 'true') filter.isFeatured = true;
  if (str(req.query.seasonal) === 'true') filter.isSeasonal = true;

  const result = await query(req, filter, { sort: SORTS[str(req.query.sort)] || SORTS.newest, page, limit });
  res.json({ success: true, ...result });
});

export const featuredProducts = asyncHandler(async (req, res) => {
  const filter = { ...(await visibleFilter(req)), isFeatured: true, isAvailable: true };
  res.json({ success: true, ...(await query(req, filter, { sort: SORTS.newest, page: 1, limit: 8 })) });
});

export const searchProducts = asyncHandler(async (req, res) => {
  const q = str(req.query.q).slice(0, 60);
  if (q.length < 2) return res.json({ success: true, data: [] });
  const filter = { ...(await visibleFilter(req)), name: { $regex: escapeRegex(q), $options: 'i' } };
  const items = await Product.find(filter).select('name slug imageUrl pricingType price minPrice').sort({ name: 1 }).limit(8);
  res.json({ success: true, data: items.map((p) => present(req, p)) });
});

const findOneVisible = async (req, cond) => {
  const p = await Product.findOne(cond).populate('category', 'name slug isActive');
  if (!p || (!req.admin && !p.category?.isActive)) throw new ApiError(404, 'Product not found.');
  return p;
};
const withRelated = async (req, p) => {
  const related = await Product.find({ category: p.category._id, _id: { $ne: p._id }, isAvailable: true }).limit(4);
  return { ...present(req, p), related: related.map((r) => present(req, r)) };
};

export const getBySlug = asyncHandler(async (req, res) => {
  const p = await findOneVisible(req, { slug: str(req.params.slug) });
  res.json({ success: true, data: await withRelated(req, p) });
});

export const getById = asyncHandler(async (req, res) => {
  const p = await findOneVisible(req, { _id: req.params.id });
  res.json({ success: true, data: await withRelated(req, p) });
});

const assertCategory = async (id) => {
  if (id && !(await Category.exists({ _id: id }))) throw new ApiError(422, 'That category does not exist.', [{ field: 'category', message: 'That category does not exist.' }]);
};

export const createProduct = asyncHandler(async (req, res) => {
  const data = pick(req.body, FIELDS);
  await assertCategory(data.category);
  data.slug = await uniqueSlug(Product, data.slug || data.name);
  const p = await Product.create(data); // schema rules decide which pricing fields are required
  res.status(201).json({ success: true, data: present(req, p) });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw new ApiError(404, 'Product not found.');
  const data = pick(req.body, FIELDS);
  await assertCategory(data.category);
  if (data.slug) data.slug = await uniqueSlug(Product, data.slug, p._id);
  const before = productFileIds(p);
  p.set(data);
  await p.save(); // runs full validation (fixed vs variant rules)
  const after = new Set(productFileIds(p));
  await queueImageCleanup(before.filter((id) => !after.has(id))); // delete replaced files only after DB save succeeded
  res.json({ success: true, data: present(req, p) });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw new ApiError(404, 'Product not found.');
  await p.deleteOne();
  await queueImageCleanup(productFileIds(p));
  res.json({ success: true, message: 'Product deleted.' });
});
