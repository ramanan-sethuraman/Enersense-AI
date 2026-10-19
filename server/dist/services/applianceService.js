"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplianceService = void 0;
const tariffService_js_1 = require("./tariffService.js");
class ApplianceService {
    static calculateDailyKwh(app) {
        const power = Math.max(0, app.ratedPowerWatts || 0);
        const qty = Math.max(1, app.quantity || 1);
        const hours = Math.min(24, Math.max(0, app.dailyOperatingHours || 0));
        const standby = Math.max(0, app.standbyPowerWatts || 0);
        const standbyHours = Math.max(0, 24 - hours);
        const activeEnergy = (power * qty * hours) / 1000;
        const standbyEnergy = (standby * qty * standbyHours) / 1000;
        return Math.round((activeEnergy + standbyEnergy) * 100) / 100;
    }
    static calculateMonthlyKwh(app) {
        const daily = this.calculateDailyKwh(app);
        const days = Math.min(31, Math.max(1, app.operatingDaysPerMonth || 30));
        return Math.round(daily * days * 100) / 100;
    }
    static analyzeAppliances(appliances, tariff, latestMeterMonthlyKwh) {
        if (!appliances || appliances.length === 0) {
            return {
                appliances: [],
                totalMonthlyKwh: 0,
                totalMonthlyCost: 0,
                highestConsumers: [],
                categoryBreakdown: [],
            };
        }
        // Calculate individual kWh
        let totalKwh = 0;
        const rawItems = appliances.map((app) => {
            const dailyKwh = this.calculateDailyKwh(app);
            const monthlyKwh = this.calculateMonthlyKwh(app);
            totalKwh += monthlyKwh;
            return {
                ...app,
                dailyKwh,
                monthlyKwh,
                monthlyCost: 0,
                percentageOfTotal: 0,
            };
        });
        // Approximate cost using tariff engine:
        // To be fair and deterministic, calculate bill for total kWh, find average effective rate per kWh,
        // and distribute energy cost + fixed share.
        const billForTotal = tariffService_js_1.TariffService.calculateBill(totalKwh, tariff);
        const effectiveRate = totalKwh > 0 ? billForTotal.estimatedTotal / totalKwh : 6.0;
        const items = rawItems.map((item) => {
            const percentage = totalKwh > 0 ? (item.monthlyKwh / totalKwh) * 100 : 0;
            const cost = Math.round(item.monthlyKwh * effectiveRate * 100) / 100;
            return {
                ...item,
                monthlyCost: cost,
                percentageOfTotal: Math.round(percentage * 10) / 10,
            };
        });
        // Sort by monthly kWh descending for ranking
        items.sort((a, b) => b.monthlyKwh - a.monthlyKwh);
        // Highest Consumers (top 3)
        const highestConsumers = items.slice(0, 3);
        // Category breakdown
        const catMap = new Map();
        for (const item of items) {
            const cat = item.category || 'Other';
            const existing = catMap.get(cat) || { totalKwh: 0, totalCost: 0, count: 0 };
            existing.totalKwh += item.monthlyKwh;
            existing.totalCost += item.monthlyCost;
            existing.count += 1;
            catMap.set(cat, existing);
        }
        const categoryBreakdown = Array.from(catMap.entries()).map(([category, val]) => ({
            category,
            totalKwh: Math.round(val.totalKwh * 100) / 100,
            totalCost: Math.round(val.totalCost * 100) / 100,
            percentage: totalKwh > 0 ? Math.round((val.totalKwh / totalKwh) * 1000) / 10 : 0,
            applianceCount: val.count,
        }));
        categoryBreakdown.sort((a, b) => b.totalKwh - a.totalKwh);
        // Discrepancy analysis with meter-recorded household consumption if provided
        let discrepancyAnalysis = undefined;
        if (typeof latestMeterMonthlyKwh === 'number' && latestMeterMonthlyKwh > 0) {
            const diff = latestMeterMonthlyKwh - totalKwh;
            const percDiff = Math.round((Math.abs(diff) / latestMeterMonthlyKwh) * 1000) / 10;
            let explanation = '';
            if (diff > 0) {
                explanation = `Meter recorded ${diff.toFixed(1)} kWh (${percDiff}%) more than your logged appliances. This is commonly accounted for by unlogged plug loads, standby vampire power, water pumps, seasonal surges, or wiring losses.`;
            }
            else {
                explanation = `Logged appliances exceed your recent meter reading by ${Math.abs(diff).toFixed(1)} kWh (${percDiff}%). Your appliances may be running fewer hours than estimated, or operating at lower duty cycles than rated capacity.`;
            }
            discrepancyAnalysis = {
                meterRecordedKwh: latestMeterMonthlyKwh,
                estimatedAppliancesKwh: Math.round(totalKwh * 100) / 100,
                differenceKwh: Math.round(diff * 100) / 100,
                percentageDifference: percDiff,
                explanation,
            };
        }
        return {
            appliances: items,
            totalMonthlyKwh: Math.round(totalKwh * 100) / 100,
            totalMonthlyCost: Math.round(billForTotal.estimatedTotal * 100) / 100,
            highestConsumers,
            categoryBreakdown,
            discrepancyAnalysis,
        };
    }
}
exports.ApplianceService = ApplianceService;
