import BusinessSettings, { PUBLIC_FIELDS } from '../models/BusinessSettings.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pick } from '../utils/helpers.js';
import { queueImageCleanup } from '../services/imageCleanup.js';

const FIELDS = ['businessName', 'logoUrl', 'logoFileId', 'description', 'announcement', 'aboutContent', 'whatsappNumber', 'contactNumber', 'address', 'openingHours', 'googleMapsUrl', 'pickupInstructions', 'whatsappGreeting'];
const SOCIAL = ['facebook', 'instagram', 'tiktok', 'youtube'];

export const getSettings = asyncHandler(async (req, res) => {
  const s = await BusinessSettings.getSingleton();
  const data = req.admin ? s.toJSON() : s.toJSON({ transform: (_d, o) => pick(o, PUBLIC_FIELDS.split(' ')) });
  if (!data.whatsappNumber) data.whatsappNumber = env.whatsappNumber; // env value is only a fallback
  res.json({ success: true, data });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const s = await BusinessSettings.getSingleton();
  const oldLogo = s.logoFileId;
  s.set(pick(req.body, FIELDS));
  if (req.body.socialLinks) s.set('socialLinks', { ...s.socialLinks?.toObject?.(), ...pick(req.body.socialLinks, SOCIAL) });
  if (req.body.pickupScheduling) s.set('pickupScheduling', { enabled: !!req.body.pickupScheduling.enabled, minLeadHours: Math.max(0, Number(req.body.pickupScheduling.minLeadHours) || 0) });
  await s.save();
  if (oldLogo && oldLogo !== s.logoFileId) await queueImageCleanup([oldLogo]);
  res.json({ success: true, data: s.toJSON() });
});
