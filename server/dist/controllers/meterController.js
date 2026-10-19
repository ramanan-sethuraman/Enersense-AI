"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeterController = void 0;
const zod_1 = require("zod");
const repository_js_1 = require("../models/repository.js");
const meterSchema = zod_1.z.object({
    meterName: zod_1.z.string().min(2, 'Meter name is required'),
    meterIdentifier: zod_1.z.string().min(2, 'Meter number or identifier is required'),
    readingUnit: zod_1.z.string().default('kWh'),
    location: zod_1.z.string().optional(),
});
exports.MeterController = {
    async getMeters(req, res) {
        try {
            const meters = await repository_js_1.MeterRepository.findByUserId(req.user._id);
            return res.status(200).json({ success: true, meters });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch meters' });
        }
    },
    async createMeter(req, res) {
        try {
            const parsed = meterSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
            }
            const meter = await repository_js_1.MeterRepository.create({
                userId: req.user._id,
                meterName: parsed.data.meterName,
                meterIdentifier: parsed.data.meterIdentifier,
                readingUnit: parsed.data.readingUnit,
                location: parsed.data.location || 'Main Panel',
            });
            return res.status(201).json({ success: true, meter, message: 'Electricity meter registered successfully.' });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to create meter' });
        }
    },
    async getMeterById(req, res) {
        try {
            const meter = await repository_js_1.MeterRepository.findById(req.params.id);
            if (!meter || meter.userId !== req.user._id) {
                return res.status(404).json({ success: false, message: 'Meter not found or unauthorized' });
            }
            return res.status(200).json({ success: true, meter });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Error retrieving meter' });
        }
    },
    async updateMeter(req, res) {
        try {
            const existing = await repository_js_1.MeterRepository.findById(req.params.id);
            if (!existing || existing.userId !== req.user._id) {
                return res.status(404).json({ success: false, message: 'Meter not found or unauthorized' });
            }
            const updated = await repository_js_1.MeterRepository.updateById(req.params.id, req.body);
            return res.status(200).json({ success: true, meter: updated, message: 'Meter updated successfully' });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Error updating meter' });
        }
    },
    async deleteMeter(req, res) {
        try {
            const existing = await repository_js_1.MeterRepository.findById(req.params.id);
            if (!existing || existing.userId !== req.user._id) {
                return res.status(404).json({ success: false, message: 'Meter not found or unauthorized' });
            }
            await repository_js_1.MeterRepository.deleteById(req.params.id);
            return res.status(200).json({ success: true, message: 'Meter removed successfully' });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Error deleting meter' });
        }
    },
};
