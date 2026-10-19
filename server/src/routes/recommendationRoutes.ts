import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth as any);

router.get('/', RecommendationController.getRecommendations as any);
router.post('/generate', RecommendationController.generate as any);
router.put('/:id', RecommendationController.updateStatus as any);

export default router;
