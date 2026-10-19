"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalController = void 0;
const zod_1 = require("zod");
const repository_js_1 = require("../models/repository.js");
const goalSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Goal name is required'),
    baselineConsumption: zod_1.z.number().min(1, 'Baseline consumption must be greater than zero kWh'),
    targetConsumption: zod_1.z.number().min(0, 'Target consumption must be non-negative'),
    targetPeriod: zod_1.z.string().min(2, 'Target period is required (e.g., November 2026)'),
    deadline: zod_1.z.string().or(zod_1.z.date()),
});
exports.GoalController = {
    async getGoals(req, res) {
        try {
            const userId = req.user._id;
            const goals = await repository_js_1.SavingsGoalRepository.findByUserId(userId);
            const readings = await repository_js_1.ReadingRepository.findByUserId(userId);
            // Calculate recent consumption
            let currentPeriodKwh = 0;
            const sorted = [...readings].sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());
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
        }
        catch (err) {
            console.error('[GoalController.getGoals] Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to retrieve savings goals' });
        }
    },
    async createGoal(req, res) {
        try {
            const parsed = goalSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
            }
            const created = await repository_js_1.SavingsGoalRepository.create({
                userId: req.user._id,
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
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to create goal' });
        }
    },
    async updateGoal(req, res) {
        try {
            const existing = await repository_js_1.SavingsGoalRepository.findById(req.params.id);
            if (!existing || existing.userId !== req.user._id) {
                return res.status(404).json({ success: false, message: 'Goal not found' });
            }
            const updated = await repository_js_1.SavingsGoalRepository.updateById(req.params.id, req.body);
            return res.status(200).json({ success: true, goal: updated, message: 'Goal updated' });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to update goal' });
        }
    },
    async deleteGoal(req, res) {
        try {
            const existing = await repository_js_1.SavingsGoalRepository.findById(req.params.id);
            if (!existing || existing.userId !== req.user._id) {
                return res.status(404).json({ success: false, message: 'Goal not found' });
            }
            await repository_js_1.SavingsGoalRepository.deleteById(req.params.id);
            return res.status(200).json({ success: true, message: 'Savings goal deleted' });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to delete goal' });
        }
    },
};
