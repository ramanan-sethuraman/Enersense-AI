import { Router } from 'express';
import { SettingsController } from '../controllers/settingsController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth as any);

router.get('/', SettingsController.getSettings as any);
router.put('/', SettingsController.updateSettings as any);
router.get('/export-data', SettingsController.exportAllData as any);
router.delete('/account', SettingsController.deleteAccount as any);

export default router;
