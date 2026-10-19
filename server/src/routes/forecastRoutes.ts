import { Router } from 'express';
import { ForecastController } from '../controllers/forecastController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth as any);

router.get('/', ForecastController.getForecast as any);
router.post('/', ForecastController.getForecast as any);
router.get('/history', ForecastController.getHistory as any);

export default router;
