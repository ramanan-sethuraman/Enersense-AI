import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { ReadingRepository, ForecastRepository } from '../models/repository.js';
import { TariffService } from '../services/tariffService.js';
import { ForecastService } from '../services/forecastService.js';

export const ForecastController = {
  async getForecast(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id!;
      const days = parseInt((req.query.days as string) || '30', 10);
      const readings = await ReadingRepository.findByUserId(userId);
      const tariff = await TariffService.getTariffForUser(
        req.user?.locationPreferences?.state,
        req.user?.locationPreferences?.distributionCompany
      );

      const forecast = ForecastService.generateForecast(userId, readings, tariff, days);

      if (forecast.isConfident) {
        await ForecastRepository.create({
          userId,
          forecastPeriod: forecast.forecastPeriod,
          predictedConsumption: forecast.predictedConsumption,
          predictedBill: forecast.predictedBill,
          assumptions: forecast.assumptions,
          uncertaintyInformation: forecast.uncertaintyInformation,
        });
      }

      return res.status(200).json({
        success: true,
        forecast,
      });
    } catch (err: any) {
      console.error('[ForecastController.getForecast] Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to compute electricity forecast' });
    }
  },

  async getHistory(req: AuthRequest, res: Response) {
    try {
      const history = await ForecastRepository.findByUserId(req.user!._id!);
      return res.status(200).json({ success: true, count: history.length, history });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve forecast history' });
    }
  },
};
