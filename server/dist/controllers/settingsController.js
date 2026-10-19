"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const repository_js_1 = require("../models/repository.js");
exports.SettingsController = {
    async getSettings(req, res) {
        try {
            const user = await repository_js_1.UserRepository.findById(req.user._id);
            if (!user)
                return res.status(404).json({ success: false, message: 'User not found' });
            const { passwordHash: _, ...safeUser } = user;
            return res.status(200).json({ success: true, settings: safeUser });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to retrieve settings' });
        }
    },
    async updateSettings(req, res) {
        try {
            const userId = req.user._id;
            const { name, locationPreferences, consumerCategory, settings } = req.body;
            const updateData = {};
            if (name)
                updateData.name = name;
            if (locationPreferences)
                updateData.locationPreferences = locationPreferences;
            if (consumerCategory)
                updateData.consumerCategory = consumerCategory;
            if (settings)
                updateData.settings = settings;
            const updated = await repository_js_1.UserRepository.updateById(userId, updateData);
            if (!updated)
                return res.status(404).json({ success: false, message: 'User not found' });
            const { passwordHash: _, ...safeUser } = updated;
            return res.status(200).json({
                success: true,
                message: 'Settings updated successfully.',
                user: safeUser,
            });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to update settings' });
        }
    },
    async exportAllData(req, res) {
        try {
            const userId = req.user._id;
            const user = await repository_js_1.UserRepository.findById(userId);
            const meters = await repository_js_1.MeterRepository.findByUserId(userId);
            const readings = await repository_js_1.ReadingRepository.findByUserId(userId);
            const appliances = await repository_js_1.ApplianceRepository.findByUserId(userId);
            const bills = await repository_js_1.BillRecordRepository.findByUserId(userId);
            const goals = await repository_js_1.SavingsGoalRepository.findByUserId(userId);
            const recommendations = await repository_js_1.RecommendationRepository.findByUserId(userId);
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
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to package export data' });
        }
    },
    async deleteAccount(req, res) {
        try {
            const userId = req.user._id;
            // Clean up all user associated entities
            await repository_js_1.UserRepository.deleteById(userId);
            const meters = await repository_js_1.MeterRepository.findByUserId(userId);
            for (const m of meters) {
                if (m._id)
                    await repository_js_1.MeterRepository.deleteById(m._id);
            }
            const readings = await repository_js_1.ReadingRepository.findByUserId(userId);
            for (const r of readings) {
                if (r._id)
                    await repository_js_1.ReadingRepository.deleteById(r._id);
            }
            const apps = await repository_js_1.ApplianceRepository.findByUserId(userId);
            for (const a of apps) {
                if (a._id)
                    await repository_js_1.ApplianceRepository.deleteById(a._id);
            }
            await repository_js_1.RecommendationRepository.deleteMany(userId);
            res.clearCookie('token');
            return res.status(200).json({
                success: true,
                message: 'Your Enersense AI account and all associated consumption data have been deleted permanently.',
            });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to delete account' });
        }
    },
};
