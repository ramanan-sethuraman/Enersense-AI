import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import {
  UserRepository,
  MeterRepository,
  ReadingRepository,
  ApplianceRepository,
  BillRecordRepository,
  SavingsGoalRepository,
  RecommendationRepository,
} from '../models/repository.js';

export const SettingsController = {
  async getSettings(req: AuthRequest, res: Response) {
    try {
      const user = await UserRepository.findById(req.user!._id!);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      const { passwordHash: _, ...safeUser } = user;
      return res.status(200).json({ success: true, settings: safeUser });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve settings' });
    }
  },

  async updateSettings(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id!;
      const { name, locationPreferences, consumerCategory, settings } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (locationPreferences) updateData.locationPreferences = locationPreferences;
      if (consumerCategory) updateData.consumerCategory = consumerCategory;
      if (settings) updateData.settings = settings;

      const updated = await UserRepository.updateById(userId, updateData);
      if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

      const { passwordHash: _, ...safeUser } = updated;
      return res.status(200).json({
        success: true,
        message: 'Settings updated successfully.',
        user: safeUser,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
  },

  async exportAllData(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id!;
      const user = await UserRepository.findById(userId);
      const meters = await MeterRepository.findByUserId(userId);
      const readings = await ReadingRepository.findByUserId(userId);
      const appliances = await ApplianceRepository.findByUserId(userId);
      const bills = await BillRecordRepository.findByUserId(userId);
      const goals = await SavingsGoalRepository.findByUserId(userId);
      const recommendations = await RecommendationRepository.findByUserId(userId);

      const exportPackage = {
        application: 'Enersense AI',
        exportedAt: new Date().toISOString(),
        user: user ? { name: user.name, email: user.email, preferences: user.locationPreferences } : null,
        meters,
        readings,
        appliances,
        bills,
        goals,
        recommendations,
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="Enersense_AI_Data_${Date.now()}.json"`);
      return res.status(200).json(exportPackage);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to package export data' });
    }
  },

  async deleteAccount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!._id!;
      // Clean up all user associated entities
      await UserRepository.deleteById(userId);
      const meters = await MeterRepository.findByUserId(userId);
      for (const m of meters) {
        if (m._id) await MeterRepository.deleteById(m._id);
      }
      const readings = await ReadingRepository.findByUserId(userId);
      for (const r of readings) {
        if (r._id) await ReadingRepository.deleteById(r._id);
      }
      const apps = await ApplianceRepository.findByUserId(userId);
      for (const a of apps) {
        if (a._id) await ApplianceRepository.deleteById(a._id);
      }
      await RecommendationRepository.deleteMany(userId);

      res.clearCookie('token');
      return res.status(200).json({
        success: true,
        message: 'Your Enersense AI account and all associated consumption data have been deleted permanently.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to delete account' });
    }
  },
};
