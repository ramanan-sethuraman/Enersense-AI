import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import {
  RecommendationRepository,
  ReadingRepository,
  ApplianceRepository,
  SavingsGoalRepository,
} from '../models/repository.js';
import { TariffService } from '../services/tariffService.js';
import { AiService } from '../services/aiService.js';

export const RecommendationController = {
  async getRecommendations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id!;
      let recs = await RecommendationRepository.findByUserId(userId);

      // Auto-generate if empty
      if (recs.length === 0) {
        const readings = await ReadingRepository.findByUserId(userId);
        const appliances = await ApplianceRepository.findByUserId(userId);
        const goals = await SavingsGoalRepository.findByUserId(userId);
        const tariff = await TariffService.getTariffForUser(
          req.user?.locationPreferences?.state,
          req.user?.locationPreferences?.distributionCompany
        );

        const generated = await AiService.generateRecommendations({
          userId,
          readings,
          appliances,
          goals,
          tariff,
        });

        for (const r of generated) {
          await RecommendationRepository.create(r);
        }
        recs = await RecommendationRepository.findByUserId(userId);
      }

      return res.status(200).json({ success: true, count: recs.length, recommendations: recs });
    } catch (err: any) {
      console.error('[RecommendationController.getRecommendations] Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
    }
  },

  async generate(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id!;
      const readings = await ReadingRepository.findByUserId(userId);
      const appliances = await ApplianceRepository.findByUserId(userId);
      const goals = await SavingsGoalRepository.findByUserId(userId);
      const tariff = await TariffService.getTariffForUser(
        req.user?.locationPreferences?.state,
        req.user?.locationPreferences?.distributionCompany
      );

      // Wipe old recommendations to refresh
      await RecommendationRepository.deleteMany(userId);

      const generated = await AiService.generateRecommendations({
        userId,
        readings,
        appliances,
        goals,
        tariff,
      });

      const saved = [];
      for (const r of generated) {
        const doc = await RecommendationRepository.create(r);
        saved.push(doc);
      }

      return res.status(200).json({
        success: true,
        message: 'Personalized AI recommendations regenerated successfully.',
        count: saved.length,
        recommendations: saved,
      });
    } catch (err: any) {
      console.error('[RecommendationController.generate] Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to generate recommendations' });
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!['active', 'implemented', 'dismissed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const updated = await RecommendationRepository.updateById(id, { status });
      return res.status(200).json({ success: true, recommendation: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Error updating recommendation' });
    }
  },
};
