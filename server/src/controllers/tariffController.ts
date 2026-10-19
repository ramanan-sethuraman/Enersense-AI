import { Request, Response } from 'express';
import { z } from 'zod';
import { TariffRepository } from '../models/repository.js';
import { TariffService } from '../services/tariffService.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const estimateSchema = z.object({
  unitsConsumed: z.number().min(0).optional(),
  previousReading: z.number().min(0).optional(),
  currentReading: z.number().min(0).optional(),
  tariffId: z.string().optional(),
  state: z.string().optional(),
  distributionCompany: z.string().optional(),
});

export const TariffController = {
  async getTariffs(req: Request, res: Response) {
    try {
      const tariffs = await TariffRepository.getAll();
      return res.status(200).json({ success: true, count: tariffs.length, tariffs });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve electricity tariffs' });
    }
  },

  async estimateBill(req: AuthRequest, res: Response) {
    try {
      const parsed = estimateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
      }

      let units = parsed.data.unitsConsumed;
      if (typeof units !== 'number') {
        if (typeof parsed.data.previousReading === 'number' && typeof parsed.data.currentReading === 'number') {
          units = Math.max(0, parsed.data.currentReading - parsed.data.previousReading);
        } else {
          return res.status(400).json({
            success: false,
            message: 'Please provide either unitsConsumed or both previousReading and currentReading.',
          });
        }
      }

      let tariff = null;
      if (parsed.data.tariffId) {
        tariff = await TariffRepository.findById(parsed.data.tariffId);
      }
      if (!tariff) {
        const state = parsed.data.state || req.user?.locationPreferences?.state || 'Maharashtra';
        const discom = parsed.data.distributionCompany || req.user?.locationPreferences?.distributionCompany;
        tariff = await TariffService.getTariffForUser(state, discom);
      }

      const calculation = TariffService.calculateBill(units, tariff);

      return res.status(200).json({
        success: true,
        tariffUsed: {
          tariffName: tariff.tariffName,
          state: tariff.state,
          distributionCompany: tariff.distributionCompany,
          fixedCharges: tariff.fixedCharges,
          calculationMethod: tariff.calculationMethod,
        },
        estimate: calculation,
      });
    } catch (err: any) {
      console.error('[TariffController.estimateBill] Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to estimate electricity bill' });
    }
  },
};
