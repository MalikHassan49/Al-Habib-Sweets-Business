import mongoose from 'mongoose';

// Retryable cleanup queue for ImageKit files that are no longer referenced (processed in Phase 5).
export default mongoose.model(
  'PendingImageCleanup',
  new mongoose.Schema({
    fileId: { type: String, required: true, unique: true },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: '' },
  }, { timestamps: true })
);
