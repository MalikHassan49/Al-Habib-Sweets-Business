import { slugify } from './slugify.js';

export const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));
export const str = (v) => (typeof v === 'string' ? v.trim() : ''); // blocks ?field[$ne]=x query injection
export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function uniqueSlug(Model, base, excludeId) {
  const root = slugify(base);
  let slug = root;
  for (let n = 2; await Model.exists({ slug, ...(excludeId && { _id: { $ne: excludeId } }) }); n++) slug = `${root}-${n}`;
  return slug;
}
