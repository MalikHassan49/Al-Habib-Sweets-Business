import { Router } from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { stats, charts } from '../controllers/dashboardController.js';

const router = Router();
router.use(protect, authorize('admin', 'superadmin'));
router.get('/stats', stats);
router.get('/charts', charts);
export default router;
