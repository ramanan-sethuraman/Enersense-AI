"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const ocrService_js_1 = require("../services/ocrService.js");
(0, vitest_1.describe)('OcrService.parseMeterDigits', () => {
    (0, vitest_1.it)('correctly recovers mechanical roller drum digits from OCR misread token [CT079m]', () => {
        const rawOcrText = `
      STEP 1: CAPTURE OR UPLOAD PHOTOGRAPH
      INDIA METER |
      [CT079m]
      3 ' -
      Clear (9) Retake Photo
    `;
        const result = ocrService_js_1.OcrService.parseMeterDigits(rawOcrText);
        (0, vitest_1.expect)(result.status).toBe('success');
        (0, vitest_1.expect)(result.extractedReading).toBe(1079);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 1079)).toBe(true);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 10790)).toBe(true);
    });
    (0, vitest_1.it)('correctly extracts digital LCD display with kWh', () => {
        const text = 'TANGEDCO Domestic Meter reading: 00482.5 kWh 240V 50Hz';
        const result = ocrService_js_1.OcrService.parseMeterDigits(text);
        (0, vitest_1.expect)(result.extractedReading).toBe(482.5);
        (0, vitest_1.expect)(result.status).toBe('success');
    });
    (0, vitest_1.it)('separates serial number from counter reading', () => {
        const text = 'MAXCELL INDIA METER AC Static Meter [010790] S.No.: 917341 Year: 04/2026';
        const result = ocrService_js_1.OcrService.parseMeterDigits(text);
        // Counter reading must take precedence over serial number
        (0, vitest_1.expect)(result.extractedReading).toBe(1079);
        const serialCandidate = result.candidates.find((c) => c.value === 917341);
        (0, vitest_1.expect)(serialCandidate).toBeDefined();
        (0, vitest_1.expect)(serialCandidate?.label).toContain('Serial');
        // Serial candidate confidence must be lower than reading confidence
        (0, vitest_1.expect)(serialCandidate.confidence).toBeLessThan(result.confidence);
    });
    (0, vitest_1.it)('corrects optical transposition 1710 on MAXCELL INDIA METER to 1079 with 100% confidence', () => {
        const rawText = `
      MAXCELL INDIA METER
      AC 1-Ph. 2-Wire Static Meter
      1710
      S.No.: 917341
    `;
        const result = ocrService_js_1.OcrService.parseMeterDigits(rawText);
        (0, vitest_1.expect)(result.status).toBe('success');
        (0, vitest_1.expect)(result.extractedReading).toBe(1079);
        (0, vitest_1.expect)(result.confidence).toBe(100);
        // Ensure 1710 is filtered out
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 1710)).toBe(false);
    });
    (0, vitest_1.it)('correctly extracts reading from L&T EM101+ Static Watthour Meter with 100% confidence', () => {
        const rawText = `
      1 PHASE 2 WIRE AC STATIC WATTHOUR METER EM101+
      IS:13779
      A2231354
      240V, 5-30A, 50Hz, Cl 1.0
      Display : 6+1 Digits LCD
      Impulse: 3200 imp/kWh
      245.45 V
    `;
        const result = ocrService_js_1.OcrService.parseMeterDigits(rawText);
        (0, vitest_1.expect)(result.status).toBe('success');
        (0, vitest_1.expect)(result.extractedReading).toBe(245.45);
        (0, vitest_1.expect)(result.confidence).toBe(100);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 245.45)).toBe(true);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 245.5)).toBe(true);
    });
    (0, vitest_1.it)('correctly extracts digital LCD display with voltage parameter suffix V', () => {
        const text = 'TNEB Static Meter LCD Display: 245.45 V';
        const result = ocrService_js_1.OcrService.parseMeterDigits(text);
        (0, vitest_1.expect)(result.status).toBe('success');
        (0, vitest_1.expect)(result.extractedReading).toBe(245.45);
    });
    (0, vitest_1.it)('correctly extracts reading from app screenshot containing L&T meter while ignoring UI tokens', () => {
        const screenshotText = `
      Main Residential Meter + Add Reading Ramanan Seth...
      READING 0% Confidence
      Electricity Meter Target
      Main Residential Meter (MTR-627796)
      Current Reading (kWh) * e.g. 1079
      Reading Date * 19-10-2026
      Extract Reading Clear Retake Photo
      A223 12540 IEEMAINN > 245.45 V
      We couldn't read this meter clearly.
      Privacy & Data Security Guarantee
    `;
        const result = ocrService_js_1.OcrService.parseMeterDigits(screenshotText);
        (0, vitest_1.expect)(result.status).toBe('success');
        (0, vitest_1.expect)(result.extractedReading).toBe(245.45);
        (0, vitest_1.expect)(result.confidence).toBe(100);
        // UI tokens must not be candidates
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 627796)).toBe(false);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 1100)).toBe(false);
    });
    (0, vitest_1.it)('correctly extracts exactly 4 digits (3260) from 5-digit cyclometer tokens (32608) with 100% confidence', () => {
        const rawText = `
      Detected Meter Candidates
      32608 kWh
      3216 kWh
      32 kWh
      Current Reading (kWh)
    `;
        const result = ocrService_js_1.OcrService.parseMeterDigits(rawText);
        (0, vitest_1.expect)(result.status).toBe('success');
        (0, vitest_1.expect)(result.extractedReading).toBe(3260); // Must be strictly 4 digits!
        (0, vitest_1.expect)(result.confidence).toBe(100);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 3260)).toBe(true);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 3260.2)).toBe(true);
    });
    (0, vitest_1.it)('correctly extracts 4 digits from bracketed 5-roller cyclometer [32608]', () => {
        const rawText = `
      SINGLE PHASE 2 WIRE ELECTRICITY METER
      [32608]
      240V 50Hz
    `;
        const result = ocrService_js_1.OcrService.parseMeterDigits(rawText);
        (0, vitest_1.expect)(result.status).toBe('success');
        (0, vitest_1.expect)(result.extractedReading).toBe(3260); // Must take 4 digits!
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 3260)).toBe(true);
    });
    (0, vitest_1.it)('decomposes general 5-digit integer into 4-digit kWh reading', () => {
        const rawText = `
      Electric Utility Meter Reading: 74825
    `;
        const result = ocrService_js_1.OcrService.parseMeterDigits(rawText);
        (0, vitest_1.expect)(result.status).toBe('success');
        (0, vitest_1.expect)(result.extractedReading).toBe(7482); // 4-digit reading takes precedence over 5-digit
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 7482)).toBe(true);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 7482.5)).toBe(true);
    });
    (0, vitest_1.it)('correctly extracts reading 31848.2 from Secure Meters i-Credit 300 while ignoring 16000 imp/kWh rating', () => {
        const rawText = `
      i-Credit 300 Type : E1C101
      1Ph 2 Wire 240V, 50Hz
      16000 imp/kWh 5-30A, Cl. 1.0
      27°C IS 13779
      SECURE METERS LIMITED INDIA
      31848.2 kW h
    `;
        const result = ocrService_js_1.OcrService.parseMeterDigits(rawText);
        (0, vitest_1.expect)(result.status).toBe('success');
        (0, vitest_1.expect)(result.extractedReading).toBe(31848.2);
        (0, vitest_1.expect)(result.confidence).toBe(100);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 31848.2)).toBe(true);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 31848)).toBe(true);
        // Impulse rating and technical specs must NEVER be candidates
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 16000)).toBe(false);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 1600)).toBe(false);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 300)).toBe(false);
        (0, vitest_1.expect)(result.candidates.some((c) => c.value === 530)).toBe(false);
    });
    (0, vitest_1.it)('handles empty or blank text gracefully with clean message', () => {
        const result = ocrService_js_1.OcrService.parseMeterDigits('');
        (0, vitest_1.expect)(result.status).toBe('failed');
        (0, vitest_1.expect)(result.extractedReading).toBeNull();
        (0, vitest_1.expect)(result.candidates).toHaveLength(0);
    });
});
