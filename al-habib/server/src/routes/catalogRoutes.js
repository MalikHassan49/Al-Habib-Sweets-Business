import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { productRules, categoryRules, settingsRules } from '../validators/catalogValidators.js';
import * as P from '../controllers/productController.js';
import * as C from '../controllers/categoryController.js';
import * as S from '../controllers/settingsController.js';

export const productRoutes = Router();
productRoutes.get('/', optionalAuth, P.listProducts);
productRoutes.get('/featured', optionalAuth, P.featuredProducts);
productRoutes.get('/search', optionalAuth, P.searchProducts);
productRoutes.get('/slug/:slug', optionalAuth, P.getBySlug);
productRoutes.get('/:id', optionalAuth, P.getById);
productRoutes.post('/', protect, productRules(), validate, P.createProduct);
productRoutes.put('/:id', protect, productRules(true), validate, P.updateProduct);
productRoutes.delete('/:id', protect, P.deleteProduct);

export const categoryRoutes = Router();
categoryRoutes.get('/', optionalAuth, C.listCategories);
categoryRoutes.get('/:id', optionalAuth, C.getCategory);
categoryRoutes.post('/', protect, categoryRules(), validate, C.createCategory);
categoryRoutes.put('/:id', protect, categoryRules(true), validate, C.updateCategory);
categoryRoutes.delete('/:id', protect, C.deleteCategory);

export const settingsRoutes = Router();
settingsRoutes.get('/', optionalAuth, S.getSettings);
settingsRoutes.put('/', protect, settingsRules, validate, S.updateSettings);
