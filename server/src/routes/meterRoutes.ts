import { Router } from 'express';
import { MeterController } from '../controllers/meterController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth as any);

router.get('/', MeterController.getMeters as any);
router.post('/', MeterController.createMeter as any);
router.get('/:id', MeterController.getMeterById as any);
router.put('/:id', MeterController.updateMeter as any);
router.delete('/:id', MeterController.deleteMeter as any);

export default router;
