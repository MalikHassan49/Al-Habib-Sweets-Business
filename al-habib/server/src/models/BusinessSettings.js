import mongoose from 'mongoose';

// Singleton. Nothing is invented: the owner fills this in from the admin settings page.
const schema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    businessName: { type: String, default: 'Al-Habib Sweets & Bakers' },
    logoUrl: { type: String, default: '' },
    logoFileId: { type: String, default: '' },
    description: { type: String, default: '' },
    announcement: { type: String, default: '' },
    aboutContent: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    openingHours: { type: String, default: '' },
    googleMapsUrl: { type: String, default: '' },
    socialLinks: { facebook: String, instagram: String, tiktok: String, youtube: String },
    pickupInstructions: { type: String, default: '' },
    whatsappGreeting: { type: String, default: 'Assalam-o-Alaikum Al-Habib Sweets & Bakers!' },
    pickupScheduling: { enabled: { type: Boolean, default: false }, minLeadHours: { type: Number, default: 2 } },
  },
  { timestamps: true }
);

// Only these fields may be returned by public endpoints (logoFileId stays private).
export const PUBLIC_FIELDS =
  'businessName logoUrl description announcement aboutContent whatsappNumber contactNumber address openingHours googleMapsUrl socialLinks pickupInstructions whatsappGreeting pickupScheduling';

schema.statics.getSingleton = async function () {
  return (await this.findOne({ key: 'main' })) || this.create({ key: 'main' });
};

export default mongoose.model('BusinessSettings', schema);
