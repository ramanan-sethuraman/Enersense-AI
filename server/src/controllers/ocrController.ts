import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { OcrService } from '../services/ocrService.js';

const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.resolve(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('[OcrController] Filesystem notice: using /tmp for serverless OCR uploads.');
}

export const OcrController = {
  async extract(req: Request, res: Response) {
    let tempPath = '';
    try {
      console.log(`[OcrController] New scan request received. File: ${req.file ? req.file.originalname : 'none'}, Base64: ${!!req.body?.imageBase64}`);
      if (req.file) {
        tempPath = req.file.path;
      } else if (req.body && req.body.imageBase64) {
        // Handle direct base64 camera capture from frontend
        const base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const targetUploadDir = process.env.VERCEL ? '/tmp/uploads' : path.resolve(process.cwd(), 'uploads');
        try {
          if (!fs.existsSync(targetUploadDir)) {
            fs.mkdirSync(targetUploadDir, { recursive: true });
          }
        } catch {}
        tempPath = path.join(targetUploadDir, `ocr_cam_${Date.now()}.png`);
        fs.writeFileSync(tempPath, buffer);
      } else {
        return res.status(400).json({
          success: false,
          message: 'No meter photograph provided. Please upload an image or take a photo with your camera.',
        });
      }

      const result = await OcrService.processMeterImage(tempPath);
      console.log(`[OcrController] Scan completed: status=${result.status}, reading=${result.extractedReading}, confidence=${result.confidence}`);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error('[OcrController.extract] Error:', err);
      // Clean up if still exists
      if (tempPath && fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (_) {}
      }

      return res.status(500).json({
        success: false,
        message: "We couldn't read this meter clearly. Please upload a clearer photograph or enter the reading manually.",
      });
    }
  },
};
