import { Router } from 'express';
import { OcrController } from '../controllers/ocrController.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// OCR endpoint accepts file upload or base64 photo
router.post('/extract', optionalAuth as any, upload.single('meterPhoto'), OcrController.extract as any);

export default router;
