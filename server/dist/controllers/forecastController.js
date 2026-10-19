"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastController = void 0;
const repository_js_1 = require("../models/repository.js");
const tariffService_js_1 = require("../services/tariffService.js");
const forecastService_js_1 = require("../services/forecastService.js");
exports.ForecastController = {
    async getForecast(req, res) {
        try {
            const userId = req.user._id;
            const days = parseInt(req.query.days || '30', 10);
            const readings = await repository_js_1.ReadingRepository.findByUserId(userId);
            const tariff = await tariffService_js_1.TariffService.getTariffForUser(req.user?.locationPreferences?.state, req.user?.locationPreferences?.distributionCompany);
            const forecast = forecastService_js_1.ForecastService.generateForecast(userId, readings, tariff, days);
            if (forecast.isConfident) {
                await repository_js_1.ForecastRepository.create({
                    userId,
                    forecastPeriod: forecast.forecastPeriod,
                    predictedConsumption: forecast.predictedConsumption,
                    predictedBill: forecast.predictedBill,
                    assumptions: forecast.assumptions,
                    uncertaintyInformation: forecast.uncertaintyInformation,
                });
            }
            return res.status(200).json({
                success: true,
                forecast,
            });
        }
        catch (err) {
            console.error('[ForecastController.getForecast] Error:', err);
            return res.status(500).json({ success: false, message: 'Failed to compute electricity forecast' });
        }
    },
    async getHistory(req, res) {
        try {
            const history = await repository_js_1.ForecastRepository.findByUserId(req.user._id);
            return res.status(200).json({ success: true, count: history.length, history });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to retrieve forecast history' });
        }
    },
};
