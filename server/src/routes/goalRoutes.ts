import { Router } from 'express';
import { GoalController } from '../controllers/goalController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth as any);

router.get('/', GoalController.getGoals as any);
router.post('/', GoalController.createGoal as any);
router.put('/:id', GoalController.updateGoal as any);
router.delete('/:id', GoalController.deleteGoal as any);

export default router;
