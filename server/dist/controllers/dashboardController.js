"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const repository_js_1 = require("../models/repository.js");
const tariffService_js_1 = require("../services/tariffService.js");
const applianceService_js_1 = require("../services/applianceService.js");
exports.DashboardController = {
    async getSummary(req, res) {
        try {
            const userId = req.user._id;
            const readings = await repository_js_1.ReadingRepository.findByUserId(userId);
            const appliances = await repository_js_1.ApplianceRepository.findByUserId(userId);
            const bills = await repository_js_1.BillRecordRepository.findByUserId(userId);
            const goals = await repository_js_1.SavingsGoalRepository.findByUserId(userId);
            const recommendations = await repository_js_1.RecommendationRepository.findByUserId(userId);
            const tariff = await tariffService_js_1.TariffService.getTariffForUser(req.user?.locationPreferences?.state, req.user?.locationPreferences?.distributionCompany);
            // Chronological sort
            const chronological = [...readings].sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());
            let currentConsumption = 0;
            let previousConsumption = 0;
            let consumptionChangePercent = 0;
            let estimatedCurrentBill = 0;
            if (chronological.length >= 2) {
                const latest = chronological[chronological.length - 1];
                const prev = chronological[chronological.length - 2];
                currentConsumption = Math.max(0, latest.readingValue - prev.readingValue);
                if (chronological.length >= 3) {
                    const older = chronological[chronological.length - 3];
                    previousConsumption = Math.max(0, prev.readingValue - older.readingValue);
                }
                if (previousConsumption > 0) {
                    const diff = currentConsumption - previousConsumption;
                    consumptionChangePercent = Math.round((diff / previousConsumption) * 1000) / 10;
                }
                const billCalc = tariffService_js_1.TariffService.calculateBill(currentConsumption > 0 ? currentConsumption : latest.readingValue, tariff);
                estimatedCurrentBill = billCalc.estimatedTotal;
            }
            else if (chronological.length === 1) {
                // Initial reading: calculate bill on cumulative reading units
                currentConsumption = chronological[0].readingValue;
                const billCalc = tariffService_js_1.TariffService.calculateBill(currentConsumption, tariff);
                estimatedCurrentBill = billCalc.estimatedTotal;
            }
            // Appliance Analysis
            const applianceAnalysis = applianceService_js_1.ApplianceService.analyzeAppliances(appliances, tariff, currentConsumption > 0 ? currentConsumption : undefined);
            // Generate dynamic insights strictly grounded in saved data
            const insights = [];
            if (chronological.length === 0) {
                insights.push('Scan your electricity meter to log your first reading and unlock instant bill calculations.');
            }
            else if (chronological.length === 1) {
                insights.push(`Initial meter reading of ${currentConsumption} kWh recorded. Estimated electricity bill is ₹${estimatedCurrentBill.toLocaleString('en-IN')}. Log your next reading to track periodic consumption change.`);
            }
            else {
                if (consumptionChangePercent > 5) {
                    insights.push(`Consumption increased by ${consumptionChangePercent}% compared with your prior billing period.`);
                }
                else if (consumptionChangePercent < -5) {
                    insights.push(`Great work! Consumption decreased by ${Math.abs(consumptionChangePercent)}% compared with the previous period.`);
                }
                else {
                    insights.push('Electricity consumption remained stable compared with your previous period.');
                }
            }
            if (applianceAnalysis.highestConsumers.length > 0) {
                const top = applianceAnalysis.highestConsumers[0];
                insights.push(`Your ${top.name} is estimated to be your largest energy consumer (~${top.monthlyKwh} kWh/mo, ${top.percentageOfTotal}% of appliances).`);
            }
            if (appliances.length === 0) {
                insights.push('No household appliances logged yet. Add your major appliances to track device-level energy usage.');
            }
            return res.status(200).json({
                success: true,
                summary: {
                    currentBillingPeriodConsumption: Math.round(currentConsumption * 100) / 100,
                    previousBillingPeriodConsumption: Math.round(previousConsumption * 100) / 100,
                    consumptionChangePercent,
                    estimatedCurrentBill,
                    currency: req.user?.settings?.currency || '₹',
                    energyUnit: req.user?.settings?.energyUnit || 'kWh',
                    totalAppliancesCount: appliances.length,
                    totalReadingsCount: readings.length,
                    activeGoalsCount: goals.filter((g) => g.status === 'in_progress').length,
                    activeRecommendationsCount: recommendations.filter((r) => r.status === 'active').length,
                },
                insights,
                highestConsumers: applianceAnalysis.highestConsumers,
                recentBills: bills.slice(0, 5),
            });
        }
        catch (err) {
            console.error('[DashboardController.getSummary] Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to generate dashboard summary' });
        }
    },
    async getConsumption(req, res) {
        try {
            const userId = req.user._id;
            const readings = await repository_js_1.ReadingRepository.findByUserId(userId);
            const tariff = await tariffService_js_1.TariffService.getTariffForUser(req.user?.locationPreferences?.state, req.user?.locationPreferences?.distributionCompany);
            // Sort chronological
            const sorted = [...readings].sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());
            const historyPoints = [];
            for (let i = 1; i < sorted.length; i++) {
                const prev = sorted[i - 1];
                const curr = sorted[i];
                const units = Math.max(0, curr.readingValue - prev.readingValue);
                const bill = tariffService_js_1.TariffService.calculateBill(units, tariff);
                const d = new Date(curr.readingDate);
                const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                historyPoints.push({
                    period: label,
                    date: d.toISOString().slice(0, 10),
                    reading: curr.readingValue,
                    unitsConsumed: Math.round(units * 10) / 10,
                    estimatedBill: bill.estimatedTotal,
                });
            }
            return res.status(200).json({
                success: true,
                points: historyPoints,
            });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch consumption trends' });
        }
    },
    async getAppliancesBreakdown(req, res) {
        try {
            const userId = req.user._id;
            const appliances = await repository_js_1.ApplianceRepository.findByUserId(userId);
            const readings = await repository_js_1.ReadingRepository.findByUserId(userId);
            let latestKwh;
            const sorted = [...readings].sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());
            if (sorted.length >= 2) {
                latestKwh = Math.max(0, sorted[sorted.length - 1].readingValue - sorted[sorted.length - 2].readingValue);
            }
            const tariff = await tariffService_js_1.TariffService.getTariffForUser(req.user?.locationPreferences?.state, req.user?.locationPreferences?.distributionCompany);
            const analysis = applianceService_js_1.ApplianceService.analyzeAppliances(appliances, tariff, latestKwh);
            return res.status(200).json({
                success: true,
                appliances: analysis.appliances,
                categoryBreakdown: analysis.categoryBreakdown,
                totalMonthlyKwh: analysis.totalMonthlyKwh,
                totalMonthlyCost: analysis.totalMonthlyCost,
                discrepancyAnalysis: analysis.discrepancyAnalysis,
            });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch appliance breakdown' });
        }
    },
};
