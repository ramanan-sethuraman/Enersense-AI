import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { SavingsGoalRepository, ReadingRepository } from '../models/repository.js';

const goalSchema = z.object({
  name: z.string().min(2, 'Goal name is required'),
  baselineConsumption: z.number().min(1, 'Baseline consumption must be greater than zero kWh'),
  targetConsumption: z.number().min(0, 'Target consumption must be non-negative'),
  targetPeriod: z.string().min(2, 'Target period is required (e.g., November 2026)'),
  deadline: z.string().or(z.date()),
});

export const GoalController = {
  async getGoals(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id!;
      const goals = await SavingsGoalRepository.findByUserId(userId);
      const readings = await ReadingRepository.findByUserId(userId);

      // Calculate recent consumption
      let currentPeriodKwh = 0;
      const sorted = [...readings].sort(
        (a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime()
      );
      if (sorted.length >= 2) {
        currentPeriodKwh = Math.max(0, sorted[sorted.length - 1].readingValue - sorted[sorted.length - 2].readingValue);
      }

      // Update progress on each goal
      const enrichedGoals = goals.map((goal) => {
        const targetDiff = goal.baselineConsumption - goal.targetConsumption;
        let progressPercent = 0;
        let status = goal.status;

        if (targetDiff > 0 && currentPeriodKwh > 0) {
          const actualReduction = goal.baselineConsumption - currentPeriodKwh;
          progressPercent = Math.min(100, Math.max(0, Math.round((actualReduction / targetDiff) * 100)));
          if (progressPercent >= 100) {
            status = 'achieved';
          }
        }

        return {
          ...goal,
          currentRecordedKwh: currentPeriodKwh,
          progressPercent,
          status,
        };
      });

      return res.status(200).json({ success: true, count: enrichedGoals.length, goals: enrichedGoals });
    } catch (err: any) {
      console.error('[GoalController.getGoals] Error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve savings goals' });
    }
  },

  async createGoal(req: AuthRequest, res: Response) {
    try {
      const parsed = goalSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
      }

      const created = await SavingsGoalRepository.create({
        userId: req.user!._id!,
        name: parsed.data.name,
        baselineConsumption: parsed.data.baselineConsumption,
        targetConsumption: parsed.data.targetConsumption,
        targetPeriod: parsed.data.targetPeriod,
        deadline: new Date(parsed.data.deadline),
        status: 'in_progress',
        currentProgress: 0,
      });

      return res.status(201).json({
        success: true,
        message: 'Savings goal established successfully!',
        goal: created,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to create goal' });
    }
  },

  async updateGoal(req: AuthRequest, res: Response) {
    try {
      const existing = await SavingsGoalRepository.findById(req.params.id);
      if (!existing || existing.userId !== req.user!._id!) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }

      const updated = await SavingsGoalRepository.updateById(req.params.id, req.body);
      return res.status(200).json({ success: true, goal: updated, message: 'Goal updated' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to update goal' });
    }
  },

  async deleteGoal(req: AuthRequest, res: Response) {
    try {
      const existing = await SavingsGoalRepository.findById(req.params.id);
      if (!existing || existing.userId !== req.user!._id!) {
        return res.status(404).json({ success: false, message: 'Goal not found' });
      }

      await SavingsGoalRepository.deleteById(req.params.id);
      return res.status(200).json({ success: true, message: 'Savings goal deleted' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to delete goal' });
    }
  },
};
