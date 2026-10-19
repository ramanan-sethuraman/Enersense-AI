import { Router } from 'express';
import { IotController } from '../controllers/iotController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth as any);

router.get('/devices', IotController.getDevices as any);
router.post('/devices', IotController.registerDevice as any);
router.post('/telemetry', IotController.ingestTelemetry as any);
router.get('/telemetry', IotController.getRecentTelemetry as any);

export default router;
