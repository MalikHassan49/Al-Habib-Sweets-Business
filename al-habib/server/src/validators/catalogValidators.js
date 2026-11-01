import { body } from 'express-validator';
import { PRICING_TYPES } from '../models/Product.js';
import { env } from '../config/env.js';

const start = (partial, field) => (partial ? body(field).optional() : body(field));
const img = (field) => body(field).optional({ values: 'falsy' }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('Image URL must be an https link.')
  .custom((v) => !env.imagekit.urlEndpoint || v.startsWith(`${env.imagekit.urlEndpoint}/`)).withMessage('Images must be uploaded through ImageKit.');

export const productRules = (partial = false) => [
  start(partial, 'name').isString().trim().isLength({ min: 2, max: 120 }).withMessage('Name must be 2 to 120 characters.'),
  start(partial, 'category').isMongoId().withMessage('Choose a valid category.'),
  start(partial, 'pricingType').isIn(PRICING_TYPES).withMessage(`Pricing type must be one of: ${PRICING_TYPES.join(', ')}.`),
  body('price').optional({ values: 'null' }).isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
  body('stockQuantity').optional().isFloat({ min: 0 }).withMessage('Stock cannot be negative.'),
  body('lowStockThreshold').optional().isFloat({ min: 0 }).withMessage('Low-stock threshold cannot be negative.'),
  body(['shortDescription', 'description', 'slug', 'unit']).optional().isString().withMessage('Must be text.'),
  body(['isAvailable', 'isFeatured', 'isSeasonal']).optional().isBoolean().withMessage('Must be true or false.'),
  body('tags').optional().isArray({ max: 20 }).withMessage('Up to 20 tags.'),
  body('tags.*').isString().trim().isLength({ max: 30 }),
  body('variants').optional().isArray({ max: 30 }).withMessage('Up to 30 variants.'),
  body('variants.*').isObject().withMessage('Each variant must be an object.'),
  img('imageUrl'),
];

export const categoryRules = (partial = false) => [
  start(partial, 'name').isString().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2 to 80 characters.'),
  body('slug').optional({ values: 'falsy' }).matches(/^[a-z0-9-]+$/).withMessage('Slug: lowercase letters, numbers and hyphens only.'),
  body('description').optional().isString().isLength({ max: 500 }),
  body('displayOrder').optional().isInt({ min: 0, max: 9999 }).withMessage('Display order must be a whole number.'),
  body('isActive').optional().isBoolean().withMessage('Must be true or false.'),
  img('imageUrl'),
];

export const settingsRules = [
  body(['businessName', 'description', 'announcement', 'address', 'openingHours', 'pickupInstructions', 'whatsappGreeting', 'contactNumber']).optional().isString().isLength({ max: 1000 }),
  body('aboutContent').optional().isString().isLength({ max: 4000 }).withMessage('About text can be up to 4000 characters.'),
  body('whatsappNumber').optional().isString().customSanitizer((v) => v.replace(/\D/g, '')).custom((v) => v === '' || /^\d{10,15}$/.test(v)).withMessage('Use the international format with country code, digits only (10 to 15 digits).'),
  body('googleMapsUrl').optional({ values: 'falsy' }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('Maps link must be an https URL.'),
  body('socialLinks.*').optional({ values: 'falsy' }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('Social links must be https URLs.'),
  img('logoUrl'),
];
