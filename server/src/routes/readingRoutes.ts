import { Router } from 'express';
import { ReadingController } from '../controllers/readingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth as any);

router.get('/', ReadingController.getReadings as any);
router.post('/', ReadingController.createReading as any);
router.get('/:id', ReadingController.getReadingById as any);
router.put('/:id', ReadingController.updateReading as any);
router.delete('/:id', ReadingController.deleteReading as any);

export default router;
