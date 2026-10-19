import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import {
  ReadingRepository,
  ApplianceRepository,
  BillRecordRepository,
  SavingsGoalRepository,
  RecommendationRepository,
} from '../models/repository.js';
import { TariffService } from '../services/tariffService.js';
import { ApplianceService } from '../services/applianceService.js';

export const ReportController = {
  async getSummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id!;
      const { startDate, endDate } = req.query;

      let readings = await ReadingRepository.findByUserId(userId);
      const appliances = await ApplianceRepository.findByUserId(userId);
      const bills = await BillRecordRepository.findByUserId(userId);
      const goals = await SavingsGoalRepository.findByUserId(userId);
      const recommendations = await RecommendationRepository.findByUserId(userId);

      const tariff = await TariffService.getTariffForUser(
        req.user?.locationPreferences?.state,
        req.user?.locationPreferences?.distributionCompany
      );

      // Filter readings by range if provided
      if (startDate) {
        const start = new Date(startDate as string).getTime();
        readings = readings.filter((r) => new Date(r.readingDate).getTime() >= start);
      }
      if (endDate) {
        const end = new Date(endDate as string).getTime();
        readings = readings.filter((r) => new Date(r.readingDate).getTime() <= end);
      }

      readings.sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());

      // Aggregate units
      let totalUnitsConsumed = 0;
      for (let i = 1; i < readings.length; i++) {
        const diff = readings[i].readingValue - readings[i - 1].readingValue;
        if (diff > 0) totalUnitsConsumed += diff;
      }

      const totalEstimatedBill = TariffService.calculateBill(totalUnitsConsumed, tariff).estimatedTotal;
      const applianceAnalysis = ApplianceService.analyzeAppliances(appliances, tariff, totalUnitsConsumed);

      return res.status(200).json({
        success: true,
        report: {
          brand: 'Enersense AI',
          reportTitle: 'Enersense AI – Intelligent Household Electricity Consumption Report',
          generatedAt: new Date().toISOString(),
          reportingPeriod: {
            startDate: startDate || (readings[0]?.readingDate ? new Date(readings[0].readingDate).toISOString().slice(0, 10) : 'All Time'),
            endDate: endDate || new Date().toISOString().slice(0, 10),
          },
          currency: req.user?.settings?.currency || '₹',
          energyUnit: req.user?.settings?.energyUnit || 'kWh',
          tariffApplied: tariff.tariffName,
          metrics: {
            totalUnitsConsumed: Math.round(totalUnitsConsumed * 10) / 10,
            totalEstimatedBill,
            readingsLogged: readings.length,
            appliancesLogged: appliances.length,
            activeGoalsCount: goals.length,
            estimatedMonthlyApplianceKwh: applianceAnalysis.totalMonthlyKwh,
            estimatedMonthlyApplianceCost: applianceAnalysis.totalMonthlyCost,
          },
          readings,
          applianceBreakdown: applianceAnalysis.categoryBreakdown,
          highestConsumers: applianceAnalysis.highestConsumers,
          recommendations: recommendations.slice(0, 5),
          goals,
          disclaimer:
            'This report distinguishes strictly between physically verified meter counter readings, calculated tariff estimates, and statistical forecasts. Actual utility bills may incorporate supplementary fuel adjustments, sanctioned load surcharges, or regional municipal cess.',
        },
      });
    } catch (err: any) {
      console.error('[ReportController.getSummary] Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to generate comprehensive report' });
    }
  },

  async exportCsv(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id!;
      const readings = await ReadingRepository.findByUserId(userId);
      readings.sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());

      // Generate CSV string
      const headers = ['Reading ID', 'Date', 'Reading Value (kWh)', 'Units Consumed', 'Source', 'Status', 'Notes'];
      const rows = readings.map((r) => [
        r._id,
        new Date(r.readingDate).toISOString().slice(0, 10),
        r.readingValue,
        r.unitsConsumed || 0,
        r.source,
        r.verificationStatus,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="Enersense_AI_Readings_${Date.now()}.csv"`);
      return res.status(200).send(csvContent);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to export CSV' });
    }
  },
};
