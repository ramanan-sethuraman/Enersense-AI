import { describe, it, expect } from 'vitest';
import { TariffService, DEFAULT_SAMPLE_TARIFFS } from '../services/tariffService.js';
import { ApplianceService } from '../services/applianceService.js';
import { ForecastService } from '../services/forecastService.js';
import { OcrService } from '../services/ocrService.js';
import { IReading, IAppliance } from '../models/types.js';

describe('Enersense AI Core Calculation Engine', () => {
  const tangedco = DEFAULT_SAMPLE_TARIFFS.find((t) => t.distributionCompany === 'TANGEDCO')!;
  const kseb = DEFAULT_SAMPLE_TARIFFS.find((t) => t.distributionCompany === 'KSEB')!;
  const msedcl = DEFAULT_SAMPLE_TARIFFS.find((t) => t.distributionCompany === 'MSEDCL')!;
  const delhi = DEFAULT_SAMPLE_TARIFFS.find((t) => t.distributionCompany === 'BSES Rajdhani')!;

  it('calculates Tamil Nadu (TANGEDCO) tariff with 200 free units for consumption <= 500 and higher slabs above 500', () => {
    // Under 200 units: energy charges should be 0 (200 units free)
    const res80 = TariffService.calculateBill(80, tangedco);
    expect(res80.unitsConsumed).toBe(80);
    expect(res80.energyCharges).toBe(0);

    // 150 units: 200 units free => 0
    const res150 = TariffService.calculateBill(150, tangedco);
    expect(res150.unitsConsumed).toBe(150);
    expect(res150.energyCharges).toBe(0);

    // 250 units (<= 500 units): first 200 free (0), next 50 units @ 4.70 = 235
    const res250 = TariffService.calculateBill(250, tangedco);
    expect(res250.unitsConsumed).toBe(250);
    expect(res250.energyCharges).toBe(235);

    // 450 units (<= 500 units): 200 @ 0 + 200 @ 4.70 (940) + 50 @ 6.30 (315) = 1255
    const res450 = TariffService.calculateBill(450, tangedco);
    expect(res450.unitsConsumed).toBe(450);
    expect(res450.energyCharges).toBe(1255);

    // 550 units (> 500 units): 100 @ 0 + 300 @ 4.70 (1410) + 100 @ 6.30 (630) + 50 @ 8.40 (420) = 2460
    const res550 = TariffService.calculateBill(550, tangedco);
    expect(res550.unitsConsumed).toBe(550);
    expect(res550.energyCharges).toBe(2460);
  });

  it('calculates Kerala (KSEB) telescopic domestic tariff accurately', () => {
    // 70 units: first 50 @ 3.15 = 157.5, next 20 @ 3.95 = 79 => 236.5
    const res = TariffService.calculateBill(70, kseb);
    expect(res.unitsConsumed).toBe(70);
    expect(res.energyCharges).toBe(236.5);
    expect(res.fixedCharges).toBe(40);
  });

  it('calculates progressive tariff slabs accurately for 0 - 100 kWh under MSEDCL', () => {
    // 50 units in slab 0-100 @ 3.36 = 168
    // Fixed: 128
    // Duty 16% on (168 + 128 = 296) = 47.36
    // Total = 343.36
    const res = TariffService.calculateBill(50, msedcl);
    expect(res.unitsConsumed).toBe(50);
    expect(res.energyCharges).toBe(168);
    expect(res.fixedCharges).toBe(128);
    expect(res.estimatedTotal).toBeCloseTo(343.36, 1);
    expect(res.calculationBreakdown.length).toBe(1);
    expect(res.disclaimer).toContain('estimated electricity bill');
  });

  it('calculates multi-slab progressive energy charges for 250 kWh', () => {
    // First 100 @ 3.36 = 336
    // Next 150 @ 7.34 = 1101
    // Total energy = 1437
    // Fixed = 128
    // Duty 16% on (1437 + 128 = 1565) = 250.4
    // Gross = 1815.4
    const res = TariffService.calculateBill(250, msedcl);
    expect(res.unitsConsumed).toBe(250);
    expect(res.energyCharges).toBe(1437);
    expect(res.calculationBreakdown.length).toBe(2);
    expect(res.calculationBreakdown[0].units).toBe(100);
    expect(res.calculationBreakdown[1].units).toBe(150);
  });

  it('handles flat rate alternative tariff configuration', () => {
    const flatTariff = {
      ...msedcl,
      calculationMethod: 'flat_rate' as const,
      tariffSlabs: [{ minUnits: 0, maxUnits: null, ratePerUnit: 7.5 }],
      fixedCharges: 100,
      otherCharges: 0,
    };
    const res = TariffService.calculateBill(100, flatTariff);
    expect(res.energyCharges).toBe(750);
    expect(res.fixedCharges).toBe(100);
    expect(res.estimatedTotal).toBe(850);
  });

  it('applies regional subsidy for eligible consumption under Delhi tariff', () => {
    const res = TariffService.calculateBill(150, delhi);
    // 150 units @ 3.0 = 450
    // 100% subsidy on 450 -> adjustments = 450
    expect(res.energyCharges).toBe(450);
    expect(res.adjustments).toBe(450);
    // Remaining is fixed (40) + surcharge (39.2) = 79.2
    expect(res.estimatedTotal).toBe(79.2);
  });

  it('calculates appliance daily and monthly kWh correctly according to formula', () => {
    // 1500W air conditioner running 6 hours/day for 30 days
    // Daily: (1500 * 1 * 6) / 1000 = 9 kWh
    // Monthly: 9 * 30 = 270 kWh
    const ac: IAppliance = {
      userId: 'test_user',
      name: 'Split AC',
      category: 'Cooling',
      ratedPowerWatts: 1500,
      quantity: 1,
      dailyOperatingHours: 6,
      operatingDaysPerMonth: 30,
      standbyPowerWatts: 0,
    };

    const daily = ApplianceService.calculateDailyKwh(ac);
    const monthly = ApplianceService.calculateMonthlyKwh(ac);

    expect(daily).toBe(9);
    expect(monthly).toBe(270);
  });

  it('computes standby phantom power in daily appliance consumption', () => {
    // 100W TV running 4 hours, 10W standby for 20 hours
    // Active: (100 * 1 * 4) / 1000 = 0.4 kWh
    // Standby: (10 * 1 * 20) / 1000 = 0.2 kWh
    // Total daily: 0.6 kWh
    const tv: IAppliance = {
      userId: 'test_user',
      name: 'Smart TV',
      category: 'Entertainment',
      ratedPowerWatts: 100,
      quantity: 1,
      dailyOperatingHours: 4,
      operatingDaysPerMonth: 30,
      standbyPowerWatts: 10,
    };

    const daily = ApplianceService.calculateDailyKwh(tv);
    expect(daily).toBe(0.6);
  });

  it('generates statistical electricity forecasts from chronological readings', () => {
    const readings: IReading[] = [
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

    const forecast = ForecastService.generateForecast('u1', readings, msedcl, 30);
    expect(forecast.isConfident).toBe(true);
    expect(forecast.predictedConsumption).toBeGreaterThan(250);
    expect(forecast.predictedConsumption).toBeLessThan(350);
    expect(forecast.predictedBill).toBeGreaterThan(0);
    expect(forecast.assumptions.length).toBeGreaterThan(0);
  });

  it('gracefully handles insufficient historical data for forecasting', () => {
    const singleReading: IReading[] = [
      {
        userId: 'u1',
        meterId: 'm1',
        readingValue: 1000,
        readingDate: new Date('2026-01-01'),
        source: 'manual',
        verificationStatus: 'verified',
      },
    ];

    const forecast = ForecastService.generateForecast('u1', singleReading, msedcl, 30);
    expect(forecast.isConfident).toBe(false);
    expect(forecast.message).toContain('More meter readings are needed');
  });

  it('extracts meter reading candidates and detects unit from OCR text', () => {
    const sampleOcrText = `
      L&T METER SINGLE PHASE
      kWh 002485.4
      240V 50Hz Class 1.0
    `;

    const parsed = OcrService.parseMeterDigits(sampleOcrText, 90);
    expect(parsed.extractedReading).toBe(2485.4);
    expect(parsed.unit).toBe('kWh');
    expect(parsed.status).toBe('success');
    expect(parsed.confidence).toBeGreaterThan(70);
  });
});
