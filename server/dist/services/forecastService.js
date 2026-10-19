"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastService = void 0;
const tariffService_js_1 = require("./tariffService.js");
class ForecastService {
    static generateForecast(userId, readings, tariff, forecastDays = 30) {
        // Filter and sort readings by date ascending
        const validReadings = readings
            .filter((r) => typeof r.readingValue === 'number' && !isNaN(r.readingValue) && r.readingDate)
            .sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());
        if (validReadings.length < 2) {
            return {
                userId,
                forecastPeriod: `Next ${forecastDays} Days`,
                predictedConsumption: 0,
                predictedBill: 0,
                assumptions: [
                    'Insufficient historical data.',
                    'At least 2 chronological meter readings are required to establish a consumption rate baseline.',
                ],
                uncertaintyInformation: 'High uncertainty: forecast unavailable due to lack of readings.',
                isConfident: false,
                message: 'More meter readings are needed to improve your prediction.',
                dailyAverageKwh: 0,
                varianceRangeKwh: { min: 0, max: 0 },
                varianceRangeBill: { min: 0, max: 0 },
            };
        }
        // Calculate consumption intervals
        const dailyRates = [];
        for (let i = 1; i < validReadings.length; i++) {
            const prev = validReadings[i - 1];
            const curr = validReadings[i];
            const deltaKwh = curr.readingValue - prev.readingValue;
            const msDiff = new Date(curr.readingDate).getTime() - new Date(prev.readingDate).getTime();
            const days = msDiff / (1000 * 60 * 60 * 24);
            if (days >= 0.5 && deltaKwh >= 0) {
                dailyRates.push(deltaKwh / days);
            }
        }
        if (dailyRates.length === 0) {
            return {
                userId,
                forecastPeriod: `Next ${forecastDays} Days`,
                predictedConsumption: 0,
                predictedBill: 0,
                assumptions: ['Readings do not span sufficient elapsed days or contain decreasing counter anomalies.'],
                uncertaintyInformation: 'Unable to compute daily rate reliably.',
                isConfident: false,
                message: 'More meter readings are needed to improve your prediction.',
                dailyAverageKwh: 0,
                varianceRangeKwh: { min: 0, max: 0 },
                varianceRangeBill: { min: 0, max: 0 },
            };
        }
        // Exponentially weighted or recent moving average
        const totalDaily = dailyRates.reduce((sum, r) => sum + r, 0);
        const avgDailyKwh = totalDaily / dailyRates.length;
        // Weight recent interval slightly more if available
        const recentRate = dailyRates[dailyRates.length - 1];
        const weightedDailyKwh = Math.round((avgDailyKwh * 0.6 + recentRate * 0.4) * 100) / 100;
        const predictedKwh = Math.round(weightedDailyKwh * forecastDays * 10) / 10;
        const billEst = tariffService_js_1.TariffService.calculateBill(predictedKwh, tariff);
        // Compute variance from intervals (std dev or range)
        const varianceRatio = dailyRates.length > 2 ? 0.1 : 0.18; // 10% to 18% variance
        const minKwh = Math.max(0, Math.round(predictedKwh * (1 - varianceRatio) * 10) / 10);
        const maxKwh = Math.round(predictedKwh * (1 + varianceRatio) * 10) / 10;
        const minBill = tariffService_js_1.TariffService.calculateBill(minKwh, tariff).estimatedTotal;
        const maxBill = tariffService_js_1.TariffService.calculateBill(maxKwh, tariff).estimatedTotal;
        const assumptions = [
            `Computed from ${validReadings.length} chronological meter readings spanning ${dailyRates.length} measurement intervals.`,
            `Baseline daily consumption rate: ${weightedDailyKwh.toFixed(2)} kWh/day.`,
            `Calculation applies ${tariff.tariffName} progressive residential tariff slabs.`,
            'Assumes steady weather and current appliance operating schedule without unforeseen surges.',
        ];
        const uncertainty = `Forecast uncertainty estimated at ±${Math.round(varianceRatio * 100)}% based on interval variance.`;
        return {
            userId,
            forecastPeriod: `Next ${forecastDays} Days`,
            predictedConsumption: predictedKwh,
            predictedBill: billEst.estimatedTotal,
            assumptions,
            uncertaintyInformation: uncertainty,
            isConfident: true,
            dailyAverageKwh: weightedDailyKwh,
            varianceRangeKwh: { min: minKwh, max: maxKwh },
            varianceRangeBill: { min: minBill, max: maxBill },
        };
    }
}
exports.ForecastService = ForecastService;
