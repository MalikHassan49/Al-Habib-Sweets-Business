import { getImageKit, isImageKitConfigured } from '../config/imagekit.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { queueImageCleanup, processPendingCleanups } from '../services/imageCleanup.js';

// Short-lived signature so the browser can upload straight to ImageKit. The private key never leaves the server.
export const uploadAuth = asyncHandler(async (_req, res) => {
  const ik = getImageKit();
  if (!isImageKitConfigured() || !ik) {
    throw new ApiError(503, 'Image uploads are not configured yet. Add IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT to server/.env and restart.');
  }
  const { token, expire, signature } = ik.getAuthenticationParameters();
  res.json({ success: true, data: { token, expire, signature, publicKey: env.imagekit.publicKey, urlEndpoint: env.imagekit.urlEndpoint } });
});

// Called when an upload succeeded but the save failed: queues the new file and removes it if nothing references it.
export const discardUpload = asyncHandler(async (req, res) => {
  const { fileId } = req.body;
  if (typeof fileId !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(fileId)) throw new ApiError(422, 'Invalid file id.');
  await queueImageCleanup([fileId]);
  res.json({ success: true, data: await processPendingCleanups() });
});

export const retryCleanup = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await processPendingCleanups(50) });
});
