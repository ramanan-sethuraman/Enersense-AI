"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tariffService_js_1 = require("../services/tariffService.js");
const applianceService_js_1 = require("../services/applianceService.js");
const forecastService_js_1 = require("../services/forecastService.js");
const ocrService_js_1 = require("../services/ocrService.js");
(0, vitest_1.describe)('Enersense AI Core Calculation Engine', () => {
    const tangedco = tariffService_js_1.DEFAULT_SAMPLE_TARIFFS.find((t) => t.distributionCompany === 'TANGEDCO');
    const kseb = tariffService_js_1.DEFAULT_SAMPLE_TARIFFS.find((t) => t.distributionCompany === 'KSEB');
    const msedcl = tariffService_js_1.DEFAULT_SAMPLE_TARIFFS.find((t) => t.distributionCompany === 'MSEDCL');
    const delhi = tariffService_js_1.DEFAULT_SAMPLE_TARIFFS.find((t) => t.distributionCompany === 'BSES Rajdhani');
    (0, vitest_1.it)('calculates Tamil Nadu (TANGEDCO) tariff with 200 free units for consumption <= 500 and higher slabs above 500', () => {
        // Under 200 units: energy charges should be 0 (200 units free)
        const res80 = tariffService_js_1.TariffService.calculateBill(80, tangedco);
        (0, vitest_1.expect)(res80.unitsConsumed).toBe(80);
        (0, vitest_1.expect)(res80.energyCharges).toBe(0);
        // 150 units: 200 units free => 0
        const res150 = tariffService_js_1.TariffService.calculateBill(150, tangedco);
        (0, vitest_1.expect)(res150.unitsConsumed).toBe(150);
        (0, vitest_1.expect)(res150.energyCharges).toBe(0);
        // 250 units (<= 500 units): first 200 free (0), next 50 units @ 4.70 = 235
        const res250 = tariffService_js_1.TariffService.calculateBill(250, tangedco);
        (0, vitest_1.expect)(res250.unitsConsumed).toBe(250);
        (0, vitest_1.expect)(res250.energyCharges).toBe(235);
        // 450 units (<= 500 units): 200 @ 0 + 200 @ 4.70 (940) + 50 @ 6.30 (315) = 1255
        const res450 = tariffService_js_1.TariffService.calculateBill(450, tangedco);
        (0, vitest_1.expect)(res450.unitsConsumed).toBe(450);
        (0, vitest_1.expect)(res450.energyCharges).toBe(1255);
        // 550 units (> 500 units): 100 @ 0 + 300 @ 4.70 (1410) + 100 @ 6.30 (630) + 50 @ 8.40 (420) = 2460
        const res550 = tariffService_js_1.TariffService.calculateBill(550, tangedco);
        (0, vitest_1.expect)(res550.unitsConsumed).toBe(550);
        (0, vitest_1.expect)(res550.energyCharges).toBe(2460);
    });
    (0, vitest_1.it)('calculates Kerala (KSEB) telescopic domestic tariff accurately', () => {
        // 70 units: first 50 @ 3.15 = 157.5, next 20 @ 3.95 = 79 => 236.5
        const res = tariffService_js_1.TariffService.calculateBill(70, kseb);
        (0, vitest_1.expect)(res.unitsConsumed).toBe(70);
        (0, vitest_1.expect)(res.energyCharges).toBe(236.5);
        (0, vitest_1.expect)(res.fixedCharges).toBe(40);
    });
    (0, vitest_1.it)('calculates progressive tariff slabs accurately for 0 - 100 kWh under MSEDCL', () => {
        // 50 units in slab 0-100 @ 3.36 = 168
        // Fixed: 128
        // Duty 16% on (168 + 128 = 296) = 47.36
        // Total = 343.36
        const res = tariffService_js_1.TariffService.calculateBill(50, msedcl);
        (0, vitest_1.expect)(res.unitsConsumed).toBe(50);
        (0, vitest_1.expect)(res.energyCharges).toBe(168);
        (0, vitest_1.expect)(res.fixedCharges).toBe(128);
        (0, vitest_1.expect)(res.estimatedTotal).toBeCloseTo(343.36, 1);
        (0, vitest_1.expect)(res.calculationBreakdown.length).toBe(1);
        (0, vitest_1.expect)(res.disclaimer).toContain('estimated electricity bill');
    });
    (0, vitest_1.it)('calculates multi-slab progressive energy charges for 250 kWh', () => {
        // First 100 @ 3.36 = 336
        // Next 150 @ 7.34 = 1101
        // Total energy = 1437
        // Fixed = 128
        // Duty 16% on (1437 + 128 = 1565) = 250.4
        // Gross = 1815.4
        const res = tariffService_js_1.TariffService.calculateBill(250, msedcl);
        (0, vitest_1.expect)(res.unitsConsumed).toBe(250);
        (0, vitest_1.expect)(res.energyCharges).toBe(1437);
        (0, vitest_1.expect)(res.calculationBreakdown.length).toBe(2);
        (0, vitest_1.expect)(res.calculationBreakdown[0].units).toBe(100);
        (0, vitest_1.expect)(res.calculationBreakdown[1].units).toBe(150);
    });
    (0, vitest_1.it)('handles flat rate alternative tariff configuration', () => {
        const flatTariff = {
            ...msedcl,
            calculationMethod: 'flat_rate',
            tariffSlabs: [{ minUnits: 0, maxUnits: null, ratePerUnit: 7.5 }],
            fixedCharges: 100,
            otherCharges: 0,
        };
        const res = tariffService_js_1.TariffService.calculateBill(100, flatTariff);
        (0, vitest_1.expect)(res.energyCharges).toBe(750);
        (0, vitest_1.expect)(res.fixedCharges).toBe(100);
        (0, vitest_1.expect)(res.estimatedTotal).toBe(850);
    });
    (0, vitest_1.it)('applies regional subsidy for eligible consumption under Delhi tariff', () => {
        const res = tariffService_js_1.TariffService.calculateBill(150, delhi);
        // 150 units @ 3.0 = 450
        // 100% subsidy on 450 -> adjustments = 450
        (0, vitest_1.expect)(res.energyCharges).toBe(450);
        (0, vitest_1.expect)(res.adjustments).toBe(450);
        // Remaining is fixed (40) + surcharge (39.2) = 79.2
        (0, vitest_1.expect)(res.estimatedTotal).toBe(79.2);
    });
    (0, vitest_1.it)('calculates appliance daily and monthly kWh correctly according to formula', () => {
        // 1500W air conditioner running 6 hours/day for 30 days
        // Daily: (1500 * 1 * 6) / 1000 = 9 kWh
        // Monthly: 9 * 30 = 270 kWh
        const ac = {
            userId: 'test_user',
            name: 'Split AC',
            category: 'Cooling',
            ratedPowerWatts: 1500,
            quantity: 1,
            dailyOperatingHours: 6,
            operatingDaysPerMonth: 30,
            standbyPowerWatts: 0,
        };
        const daily = applianceService_js_1.ApplianceService.calculateDailyKwh(ac);
        const monthly = applianceService_js_1.ApplianceService.calculateMonthlyKwh(ac);
        (0, vitest_1.expect)(daily).toBe(9);
        (0, vitest_1.expect)(monthly).toBe(270);
    });
    (0, vitest_1.it)('computes standby phantom power in daily appliance consumption', () => {
        // 100W TV running 4 hours, 10W standby for 20 hours
        // Active: (100 * 1 * 4) / 1000 = 0.4 kWh
        // Standby: (10 * 1 * 20) / 1000 = 0.2 kWh
        // Total daily: 0.6 kWh
        const tv = {
            userId: 'test_user',
            name: 'Smart TV',
            category: 'Entertainment',
            ratedPowerWatts: 100,
            quantity: 1,
            dailyOperatingHours: 4,
            operatingDaysPerMonth: 30,
            standbyPowerWatts: 10,
        };
        const daily = applianceService_js_1.ApplianceService.calculateDailyKwh(tv);
        (0, vitest_1.expect)(daily).toBe(0.6);
    });
    (0, vitest_1.it)('generates statistical electricity forecasts from chronological readings', () => {
        const readings = [
            {
                userId: 'u1',
                meterId: 'm1',
                readingValue: 1000,
                readingDate: new Date('2026-01-01'),
                source: 'manual',
                verificationStatus: 'verified',
            },
            {
                userId: 'u1',
                meterId: 'm1',
                readingValue: 1300, // 300 kWh in 30 days = 10 kWh/day
                readingDate: new Date('2026-01-31'),
                source: 'manual',
                verificationStatus: 'verified',
            },
        ];
        const forecast = forecastService_js_1.ForecastService.generateForecast('u1', readings, msedcl, 30);
        (0, vitest_1.expect)(forecast.isConfident).toBe(true);
        (0, vitest_1.expect)(forecast.predictedConsumption).toBeGreaterThan(250);
        (0, vitest_1.expect)(forecast.predictedConsumption).toBeLessThan(350);
        (0, vitest_1.expect)(forecast.predictedBill).toBeGreaterThan(0);
        (0, vitest_1.expect)(forecast.assumptions.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('gracefully handles insufficient historical data for forecasting', () => {
        const singleReading = [
            {
                userId: 'u1',
                meterId: 'm1',
                readingValue: 1000,
                readingDate: new Date('2026-01-01'),
                source: 'manual',
                verificationStatus: 'verified',
            },
        ];
        const forecast = forecastService_js_1.ForecastService.generateForecast('u1', singleReading, msedcl, 30);
        (0, vitest_1.expect)(forecast.isConfident).toBe(false);
        (0, vitest_1.expect)(forecast.message).toContain('More meter readings are needed');
    });
    (0, vitest_1.it)('extracts meter reading candidates and detects unit from OCR text', () => {
        const sampleOcrText = `
      L&T METER SINGLE PHASE
      kWh 002485.4
      240V 50Hz Class 1.0
    `;
        const parsed = ocrService_js_1.OcrService.parseMeterDigits(sampleOcrText, 90);
        (0, vitest_1.expect)(parsed.extractedReading).toBe(2485.4);
        (0, vitest_1.expect)(parsed.unit).toBe('kWh');
        (0, vitest_1.expect)(parsed.status).toBe('success');
        (0, vitest_1.expect)(parsed.confidence).toBeGreaterThan(70);
    });
});
