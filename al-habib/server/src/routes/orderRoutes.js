import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validateMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { quoteOrder } from '../services/orderQuote.js';

const router = Router();
router.post(
  '/quote',
  [
    body('items').isArray({ min: 1, max: 50 }).withMessage('Add at least one item.'),
    body('items.*.productId').isMongoId().withMessage('Invalid product.'),
    body('items.*.variantId').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid option.'),
    body('items.*.qty').isInt({ min: 1, max: 999 }).withMessage('Quantity must be a whole number from 1 to 999.').toInt(),
  ],
  validate,
  asyncHandler(async (req, res) => res.json({ success: true, data: await quoteOrder(req.body.items) }))
);
export default router;
