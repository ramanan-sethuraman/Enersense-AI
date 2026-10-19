"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ocrController_js_1 = require("../controllers/ocrController.js");
const uploadMiddleware_js_1 = require("../middleware/uploadMiddleware.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
// OCR endpoint accepts file upload or base64 photo
router.post('/extract', authMiddleware_js_1.optionalAuth, uploadMiddleware_js_1.upload.single('meterPhoto'), ocrController_js_1.OcrController.extract);
exports.default = router;
