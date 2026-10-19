"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcrController = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ocrService_js_1 = require("../services/ocrService.js");
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path_1.default.resolve(process.cwd(), 'uploads');
try {
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
}
catch (e) {
    console.warn('[OcrController] Filesystem notice: using /tmp for serverless OCR uploads.');
}
exports.OcrController = {
    async extract(req, res) {
        let tempPath = '';
        try {
            console.log(`[OcrController] New scan request received. File: ${req.file ? req.file.originalname : 'none'}, Base64: ${!!req.body?.imageBase64}`);
            if (req.file) {
                tempPath = req.file.path;
            }
            else if (req.body && req.body.imageBase64) {
                // Handle direct base64 camera capture from frontend
                const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                const targetUploadDir = process.env.VERCEL ? '/tmp/uploads' : path_1.default.resolve(process.cwd(), 'uploads');
                try {
                    if (!fs_1.default.existsSync(targetUploadDir)) {
                        fs_1.default.mkdirSync(targetUploadDir, { recursive: true });
                    }
                }
                catch { }
                tempPath = path_1.default.join(targetUploadDir, `ocr_cam_${Date.now()}.png`);
                fs_1.default.writeFileSync(tempPath, buffer);
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: 'No meter photograph provided. Please upload an image or take a photo with your camera.',
                });
            }
            const result = await ocrService_js_1.OcrService.processMeterImage(tempPath);
            console.log(`[OcrController] Scan completed: status=${result.status}, reading=${result.extractedReading}, confidence=${result.confidence}`);
            return res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (err) {
            console.error('[OcrController.extract] Error:', err);
            // Clean up if still exists
            if (tempPath && fs_1.default.existsSync(tempPath)) {
                try {
                    fs_1.default.unlinkSync(tempPath);
                }
                catch (_) { }
            }
            return res.status(500).json({
                success: false,
                message: "We couldn't read this meter clearly. Please upload a clearer photograph or enter the reading manually.",
            });
        }
    },
};
