"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TariffController = void 0;
const zod_1 = require("zod");
const repository_js_1 = require("../models/repository.js");
const tariffService_js_1 = require("../services/tariffService.js");
const estimateSchema = zod_1.z.object({
    unitsConsumed: zod_1.z.number().min(0).optional(),
    previousReading: zod_1.z.number().min(0).optional(),
    currentReading: zod_1.z.number().min(0).optional(),
    tariffId: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    distributionCompany: zod_1.z.string().optional(),
});
exports.TariffController = {
    async getTariffs(req, res) {
        try {
            const tariffs = await repository_js_1.TariffRepository.getAll();
            return res.status(200).json({ success: true, count: tariffs.length, tariffs });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to retrieve electricity tariffs' });
        }
    },
    async estimateBill(req, res) {
        try {
            const parsed = estimateSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
            }
            let units = parsed.data.unitsConsumed;
            if (typeof units !== 'number') {
                if (typeof parsed.data.previousReading === 'number' && typeof parsed.data.currentReading === 'number') {
                    units = Math.max(0, parsed.data.currentReading - parsed.data.previousReading);
                }
                else {
                    return res.status(400).json({
                        success: false,
                        message: 'Please provide either unitsConsumed or both previousReading and currentReading.',
                    });
                }
            }
            let tariff = null;
            if (parsed.data.tariffId) {
                tariff = await repository_js_1.TariffRepository.findById(parsed.data.tariffId);
            }
            if (!tariff) {
                const state = parsed.data.state || req.user?.locationPreferences?.state || 'Maharashtra';
                const discom = parsed.data.distributionCompany || req.user?.locationPreferences?.distributionCompany;
                tariff = await tariffService_js_1.TariffService.getTariffForUser(state, discom);
            }
            const calculation = tariffService_js_1.TariffService.calculateBill(units, tariff);
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
        }
        catch (err) {
            console.error('[TariffController.estimateBill] Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to estimate electricity bill' });
        }
    },
};
