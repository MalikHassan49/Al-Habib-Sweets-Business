import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadAuth, discardUpload, retryCleanup } from '../controllers/imageController.js';

const router = Router();
router.use(protect, authorize('admin', 'superadmin'));
router.get('/auth', uploadAuth);
router.post('/discard', discardUpload);
router.post('/cleanup', retryCleanup);
export default router;
