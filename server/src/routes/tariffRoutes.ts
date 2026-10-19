import { Router } from 'express';
import { TariffController } from '../controllers/tariffController.js';

const router = Router();

router.get('/', TariffController.getTariffs as any);
router.post('/estimate', TariffController.estimateBill as any);

export default router;
