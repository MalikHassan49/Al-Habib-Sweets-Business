import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick, uniqueSlug } from '../utils/helpers.js';
import { queueImageCleanup } from '../services/imageCleanup.js';

const FIELDS = ['name', 'slug', 'description', 'imageUrl', 'imageFileId', 'isActive', 'displayOrder'];
const present = (req, c) => {
  const o = c.toJSON();
  if (!req.admin) delete o.imageFileId;
  return o;
};

export const listCategories = asyncHandler(async (req, res) => {
  const cats = await Category.find(req.admin ? {} : { isActive: true }).sort({ displayOrder: 1, name: 1 });
  const counts = await Product.aggregate([{ $group: { _id: '$category', n: { $sum: 1 } } }]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  res.json({ success: true, data: cats.map((c) => ({ ...present(req, c), productCount: map.get(String(c._id)) || 0 })) });
});

export const getCategory = asyncHandler(async (req, res) => {
  const c = await Category.findById(req.params.id);
  if (!c || (!c.isActive && !req.admin)) throw new ApiError(404, 'Category not found.');
  res.json({ success: true, data: present(req, c) });
});

export const createCategory = asyncHandler(async (req, res) => {
  const data = pick(req.body, FIELDS);
  data.slug = await uniqueSlug(Category, data.slug || data.name);
  const c = await Category.create(data);
  res.status(201).json({ success: true, data: present(req, c) });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const c = await Category.findById(req.params.id);
  if (!c) throw new ApiError(404, 'Category not found.');
  const data = pick(req.body, FIELDS);
  const oldFileId = c.imageFileId;
  if (data.slug) data.slug = await uniqueSlug(Category, data.slug, c._id);
  c.set(data);
  await c.save();
  if (oldFileId && oldFileId !== c.imageFileId) await queueImageCleanup([oldFileId]); // old file removed only after DB saved
  res.json({ success: true, data: present(req, c) });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const c = await Category.findById(req.params.id);
  if (!c) throw new ApiError(404, 'Category not found.');
  const n = await Product.countDocuments({ category: c._id });
  if (n) throw new ApiError(409, `This category still has ${n} product(s). Move or delete them first, or disable the category instead.`);
  await c.deleteOne();
  await queueImageCleanup([c.imageFileId]);
  res.json({ success: true, message: 'Category deleted.' });
});
