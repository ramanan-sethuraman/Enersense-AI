"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationController = void 0;
const repository_js_1 = require("../models/repository.js");
const tariffService_js_1 = require("../services/tariffService.js");
const aiService_js_1 = require("../services/aiService.js");
exports.RecommendationController = {
    async getRecommendations(req, res) {
        try {
            const userId = req.user._id;
            let recs = await repository_js_1.RecommendationRepository.findByUserId(userId);
            // Auto-generate if empty
            if (recs.length === 0) {
                const readings = await repository_js_1.ReadingRepository.findByUserId(userId);
                const appliances = await repository_js_1.ApplianceRepository.findByUserId(userId);
                const goals = await repository_js_1.SavingsGoalRepository.findByUserId(userId);
                const tariff = await tariffService_js_1.TariffService.getTariffForUser(req.user?.locationPreferences?.state, req.user?.locationPreferences?.distributionCompany);
                const generated = await aiService_js_1.AiService.generateRecommendations({
                    userId,
                    readings,
                    appliances,
                    goals,
                    tariff,
                });
                for (const r of generated) {
                    await repository_js_1.RecommendationRepository.create(r);
                }
                recs = await repository_js_1.RecommendationRepository.findByUserId(userId);
            }
            return res.status(200).json({ success: true, count: recs.length, recommendations: recs });
        }
        catch (err) {
            console.error('[RecommendationController.getRecommendations] Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch recommendations' });
        }
    },
    async generate(req, res) {
        try {
            const userId = req.user._id;
            const readings = await repository_js_1.ReadingRepository.findByUserId(userId);
            const appliances = await repository_js_1.ApplianceRepository.findByUserId(userId);
            const goals = await repository_js_1.SavingsGoalRepository.findByUserId(userId);
            const tariff = await tariffService_js_1.TariffService.getTariffForUser(req.user?.locationPreferences?.state, req.user?.locationPreferences?.distributionCompany);
            // Wipe old recommendations to refresh
            await repository_js_1.RecommendationRepository.deleteMany(userId);
            const generated = await aiService_js_1.AiService.generateRecommendations({
                userId,
                readings,
                appliances,
                goals,
                tariff,
            });
            const saved = [];
            for (const r of generated) {
                const doc = await repository_js_1.RecommendationRepository.create(r);
                saved.push(doc);
            }
            return res.status(200).json({
                success: true,
                message: 'Personalized AI recommendations regenerated successfully.',
                count: saved.length,
                recommendations: saved,
            });
        }
        catch (err) {
            console.error('[RecommendationController.generate] Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to generate recommendations' });
        }
    },
    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!['active', 'implemented', 'dismissed'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }
            const updated = await repository_js_1.RecommendationRepository.updateById(id, { status });
            return res.status(200).json({ success: true, recommendation: updated });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Error updating recommendation' });
        }
    },
};
