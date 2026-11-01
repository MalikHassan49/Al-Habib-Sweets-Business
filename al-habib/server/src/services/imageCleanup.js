import PendingImageCleanup from '../models/PendingImageCleanup.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import BusinessSettings from '../models/BusinessSettings.js';
import { getImageKit } from '../config/imagekit.js';

export const productFileIds = (p) => [p.imageFileId, ...(p.variants || []).map((v) => v.imageFileId)].filter(Boolean);

export async function queueImageCleanup(fileIds) {
  const ids = [...new Set(fileIds.filter(Boolean))];
  if (!ids.length) return;
  await PendingImageCleanup.bulkWrite(
    ids.map((fileId) => ({ updateOne: { filter: { fileId }, update: { $setOnInsert: { fileId } }, upsert: true } }))
  );
}

// A file is only deleted when nothing in the database still points to it.
const isReferenced = async (id) =>
  (await Promise.all([
    Product.exists({ $or: [{ imageFileId: id }, { 'variants.imageFileId': id }] }),
    Category.exists({ imageFileId: id }),
    BusinessSettings.exists({ logoFileId: id }),
  ])).some(Boolean);

const isNotFound = (e) => e?.$ResponseMetadata?.statusCode === 404 || /not found|404/i.test(e?.message || '');

export async function processPendingCleanups(limit = 25) {
  const ik = getImageKit();
  if (!ik) return { deleted: 0, kept: 0, failed: 0, note: 'ImageKit is not configured.' };
  const jobs = await PendingImageCleanup.find({ attempts: { $lt: 10 } }).sort({ createdAt: 1 }).limit(limit);
  const out = { deleted: 0, kept: 0, failed: 0 };
  for (const job of jobs) {
    if (await isReferenced(job.fileId)) { await job.deleteOne(); out.kept++; continue; }
    try {
      await ik.deleteFile(job.fileId);
      await job.deleteOne();
      out.deleted++;
    } catch (e) {
      if (isNotFound(e)) { await job.deleteOne(); out.deleted++; continue; }
      job.attempts += 1; // retried by the scheduled job; given up after 10 attempts but kept for review
      job.lastError = String(e?.message || e).slice(0, 300);
      await job.save();
      out.failed++;
      console.error('ImageKit cleanup failed:', job.fileId, job.lastError);
    }
  }
  return out;
}
