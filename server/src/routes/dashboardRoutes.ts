import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth as any);

router.get('/summary', DashboardController.getSummary as any);
router.get('/consumption', DashboardController.getConsumption as any);
router.get('/appliances', DashboardController.getAppliancesBreakdown as any);

export default router;
