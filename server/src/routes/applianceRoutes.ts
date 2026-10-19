import { Router } from 'express';
import { ApplianceController } from '../controllers/applianceController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth as any);

router.get('/', ApplianceController.getAppliances as any);
router.post('/', ApplianceController.createAppliance as any);
router.put('/:id', ApplianceController.updateAppliance as any);
router.delete('/:id', ApplianceController.deleteAppliance as any);

export default router;
