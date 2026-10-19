"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplianceController = void 0;
const zod_1 = require("zod");
const repository_js_1 = require("../models/repository.js");
const tariffService_js_1 = require("../services/tariffService.js");
const applianceService_js_1 = require("../services/applianceService.js");
const applianceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Appliance name is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    ratedPowerWatts: zod_1.z.number().min(1, 'Rated power must be greater than zero Watts'),
    quantity: zod_1.z.number().min(1, 'Quantity must be at least 1').default(1),
    dailyOperatingHours: zod_1.z
        .number()
        .min(0, 'Operating hours cannot be negative')
        .max(24, 'Operating hours cannot exceed 24 hours per day'),
    operatingDaysPerMonth: zod_1.z
        .number()
        .min(1, 'Operating days must be at least 1')
        .max(31, 'Operating days cannot exceed 31 days per month')
        .default(30),
    standbyPowerWatts: zod_1.z.number().min(0).optional().default(0),
    usageSchedule: zod_1.z.string().optional(),
});
exports.ApplianceController = {
    async getAppliances(req, res) {
        try {
            const appliances = await repository_js_1.ApplianceRepository.findByUserId(req.user._id);
            const tariff = await tariffService_js_1.TariffService.getTariffForUser(req.user?.locationPreferences?.state, req.user?.locationPreferences?.distributionCompany);
            const analysis = applianceService_js_1.ApplianceService.analyzeAppliances(appliances, tariff);
            return res.status(200).json({
                success: true,
                count: appliances.length,
                appliances: analysis.appliances,
                summary: {
                    totalMonthlyKwh: analysis.totalMonthlyKwh,
                    totalMonthlyCost: analysis.totalMonthlyCost,
                    highestConsumers: analysis.highestConsumers,
                    categoryBreakdown: analysis.categoryBreakdown,
                },
            });
        }
        catch (err) {
            console.error('[ApplianceController.getAppliances] Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to retrieve appliances' });
        }
    },
    async createAppliance(req, res) {
        try {
            const parsed = applianceSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
            }
            const created = await repository_js_1.ApplianceRepository.create({
                userId: req.user._id,
                ...parsed.data,
            });
            return res.status(201).json({
                success: true,
                message: 'Appliance added successfully.',
                appliance: created,
            });
        }
        catch (err) {
            console.error('[ApplianceController.createAppliance] Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to add appliance' });
        }
    },
    async updateAppliance(req, res) {
        try {
            const existing = await repository_js_1.ApplianceRepository.findById(req.params.id);
            if (!existing || existing.userId !== req.user._id) {
                return res.status(404).json({ success: false, message: 'Appliance not found or unauthorized' });
            }
            const parsed = applianceSchema.partial().safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
            }
            const updated = await repository_js_1.ApplianceRepository.updateById(req.params.id, parsed.data);
            return res.status(200).json({
                success: true,
                message: 'Appliance updated successfully.',
                appliance: updated,
            });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to update appliance' });
        }
    },
    async deleteAppliance(req, res) {
        try {
            const existing = await repository_js_1.ApplianceRepository.findById(req.params.id);
            if (!existing || existing.userId !== req.user._id) {
                return res.status(404).json({ success: false, message: 'Appliance not found or unauthorized' });
            }
            await repository_js_1.ApplianceRepository.deleteById(req.params.id);
            return res.status(200).json({ success: true, message: 'Appliance removed successfully.' });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to delete appliance' });
        }
    },
};
