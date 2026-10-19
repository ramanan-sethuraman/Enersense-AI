import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth as any);

router.get('/summary', ReportController.getSummary as any);
router.get('/export', ReportController.exportCsv as any);

export default router;
