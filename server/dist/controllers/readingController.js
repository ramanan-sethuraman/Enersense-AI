"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadingController = void 0;
const zod_1 = require("zod");
const repository_js_1 = require("../models/repository.js");
const tariffService_js_1 = require("../services/tariffService.js");
const readingSchema = zod_1.z.object({
    meterId: zod_1.z.string().min(1, 'Meter ID is required'),
    readingValue: zod_1.z.number().min(0, 'Meter reading cannot be negative'),
    readingDate: zod_1.z.string().or(zod_1.z.date()),
    source: zod_1.z.enum(['manual', 'ocr', 'iot']).default('manual'),
    verificationStatus: zod_1.z.enum(['verified', 'pending', 'flagged']).default('verified'),
    confidence: zod_1.z.number().optional().default(100),
    imageUrl: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
    allowRolloverOrReset: zod_1.z.boolean().optional().default(false),
});
exports.ReadingController = {
    async getReadings(req, res) {
        try {
            const { search, meterId, startDate, endDate, sort } = req.query;
            let filter = {};
            if (meterId)
                filter.meterId = meterId;
            let readings = await repository_js_1.ReadingRepository.findByUserId(req.user._id, filter);
            // In-memory filter for dates & search
            if (startDate) {
                const start = new Date(startDate).getTime();
                readings = readings.filter((r) => new Date(r.readingDate).getTime() >= start);
            }
            if (endDate) {
                const end = new Date(endDate).getTime();
                readings = readings.filter((r) => new Date(r.readingDate).getTime() <= end);
            }
            if (search) {
                const q = search.toLowerCase();
                readings = readings.filter((r) => r.readingValue.toString().includes(q) ||
                    (r.notes && r.notes.toLowerCase().includes(q)) ||
                    (r.source && r.source.toLowerCase().includes(q)));
            }
            if (sort === 'date_asc') {
                readings.sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());
            }
            else {
                readings.sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
            }
            return res.status(200).json({ success: true, count: readings.length, readings });
        }
        catch (err) {
            console.error('[ReadingController.getReadings] Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch meter readings' });
        }
    },
    async createReading(req, res) {
        try {
            const parsed = readingSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
            }
            const { meterId, readingValue, readingDate, source, verificationStatus, confidence, imageUrl, notes, allowRolloverOrReset, } = parsed.data;
            // Verify meter ownership
            const meter = await repository_js_1.MeterRepository.findById(meterId);
            if (!meter || meter.userId !== req.user._id) {
                return res.status(404).json({ success: false, message: 'Specified electricity meter not found or unauthorized' });
            }
            const newDate = new Date(readingDate);
            if (isNaN(newDate.getTime())) {
                return res.status(400).json({ success: false, message: 'Invalid reading date provided' });
            }
            // Fetch existing readings for this meter
            const existingReadings = await repository_js_1.ReadingRepository.findByMeterId(meterId);
            // Duplicate check: same day and same reading value
            const isDuplicate = existingReadings.some((r) => {
                const rDate = new Date(r.readingDate);
                return (rDate.toISOString().slice(0, 10) === newDate.toISOString().slice(0, 10) &&
                    Math.abs(r.readingValue - readingValue) < 0.01);
            });
            if (isDuplicate) {
                const dup = existingReadings.find((r) => {
                    const rDate = new Date(r.readingDate);
                    return (rDate.toISOString().slice(0, 10) === newDate.toISOString().slice(0, 10) &&
                        Math.abs(r.readingValue - readingValue) < 0.01);
                });
                const tariff = await tariffService_js_1.TariffService.getTariffForUser(req.user.locationPreferences?.state, req.user.locationPreferences?.distributionCompany);
                const billEst = tariffService_js_1.TariffService.calculateBill(readingValue, tariff);
                return res.status(200).json({
                    success: true,
                    isDuplicate: true,
                    message: `Meter reading (${readingValue} kWh) on ${newDate.toISOString().slice(0, 10)} is up to date.`,
                    reading: dup,
                    unitsConsumed: dup?.unitsConsumed || 0,
                    estimatedBill: billEst.estimatedTotal,
                });
            }
            // Find previous chronological reading
            const previousChronological = existingReadings
                .filter((r) => new Date(r.readingDate).getTime() < newDate.getTime())
                .sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime())[0];
            let unitsConsumed = 0;
            if (previousChronological) {
                if (readingValue < previousChronological.readingValue) {
                    if (!allowRolloverOrReset) {
                        return res.status(400).json({
                            success: false,
                            isRolloverWarning: true,
                            message: `Current reading (${readingValue} kWh) is lower than previous reading (${previousChronological.readingValue} kWh on ${new Date(previousChronological.readingDate).toLocaleDateString()}). Please verify if the meter was replaced or rolled over.`,
                        });
                    }
                    else {
                        // Assume rollover or meter reset
                        unitsConsumed = readingValue; // or 0
                    }
                }
                else {
                    unitsConsumed = Math.round((readingValue - previousChronological.readingValue) * 100) / 100;
                }
            }
            const reading = await repository_js_1.ReadingRepository.create({
                userId: req.user._id,
                meterId,
                readingValue,
                readingDate: newDate,
                source,
                verificationStatus,
                confidence,
                imageUrl,
                notes,
                unitsConsumed,
            });
            // Automatically generate estimated bill record for this billing interval
            const tariff = await tariffService_js_1.TariffService.getTariffForUser(req.user.locationPreferences?.state, req.user.locationPreferences?.distributionCompany);
            const unitsForBill = unitsConsumed > 0 ? unitsConsumed : readingValue;
            const billEst = tariffService_js_1.TariffService.calculateBill(unitsForBill, tariff);
            await repository_js_1.BillRecordRepository.create({
                userId: req.user._id,
                meterId,
                billingPeriodStart: previousChronological ? previousChronological.readingDate : new Date(newDate.getTime() - 30 * 24 * 60 * 60 * 1000),
                billingPeriodEnd: newDate,
                previousReading: previousChronological ? previousChronological.readingValue : 0,
                currentReading: readingValue,
                unitsConsumed: unitsForBill,
                tariffConfiguration: {
                    tariffName: tariff.tariffName,
                    state: tariff.state,
                    distributionCompany: tariff.distributionCompany,
                    fixedCharges: tariff.fixedCharges,
                    calculationMethod: tariff.calculationMethod,
                },
                energyCharges: billEst.energyCharges,
                fixedCharges: billEst.fixedCharges,
                otherCharges: billEst.otherCharges,
                adjustments: billEst.adjustments,
                estimatedTotal: billEst.estimatedTotal,
                calculationBreakdown: billEst.calculationBreakdown,
            });
            return res.status(201).json({
                success: true,
                message: 'Meter reading saved successfully.',
                reading,
                unitsConsumed,
                estimatedBill: billEst.estimatedTotal,
            });
        }
        catch (err) {
            console.error('[ReadingController.createReading] Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to record meter reading' });
        }
    },
    async getReadingById(req, res) {
        try {
            const reading = await repository_js_1.ReadingRepository.findById(req.params.id);
            if (!reading || reading.userId !== req.user._id) {
                return res.status(404).json({ success: false, message: 'Reading not found' });
            }
            return res.status(200).json({ success: true, reading });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Error fetching reading' });
        }
    },
    async updateReading(req, res) {
        try {
            const reading = await repository_js_1.ReadingRepository.findById(req.params.id);
            if (!reading || reading.userId !== req.user._id) {
                return res.status(404).json({ success: false, message: 'Reading not found' });
            }
            const updated = await repository_js_1.ReadingRepository.updateById(req.params.id, req.body);
            return res.status(200).json({ success: true, reading: updated, message: 'Reading updated successfully.' });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Error updating reading' });
        }
    },
    async deleteReading(req, res) {
        try {
            const reading = await repository_js_1.ReadingRepository.findById(req.params.id);
            if (!reading || reading.userId !== req.user._id) {
                return res.status(404).json({ success: false, message: 'Reading not found' });
            }
            await repository_js_1.ReadingRepository.deleteById(req.params.id);
            return res.status(200).json({ success: true, message: 'Meter reading removed successfully.' });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Error deleting reading' });
        }
    },
};
