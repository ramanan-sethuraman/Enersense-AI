"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IotController = void 0;
const repository_js_1 = require("../models/repository.js");
exports.IotController = {
    async getDevices(req, res) {
        try {
            const devices = await repository_js_1.IotRepository.getDevices(req.user._id);
            return res.status(200).json({
                success: true,
                count: devices.length,
                devices,
                note: 'Future Smart Meter & IoT Gateway layer. Enables direct connection with ESP32/Raspberry Pi current transformer sensors.',
            });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to retrieve IoT devices' });
        }
    },
    async registerDevice(req, res) {
        try {
            const { deviceId, deviceName, deviceType } = req.body;
            if (!deviceId || !deviceName) {
                return res.status(400).json({ success: false, message: 'Device ID and Name are required' });
            }
            const device = await repository_js_1.IotRepository.createDevice({
                userId: req.user._id,
                deviceId,
                deviceName,
                deviceType: deviceType || 'smart_meter',
                status: 'online',
                lastSeen: new Date(),
                firmwareVersion: 'v1.0.2-iot',
            });
            return res.status(201).json({
                success: true,
                message: 'Smart meter IoT device registered successfully.',
                device,
            });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to register IoT device' });
        }
    },
    async ingestTelemetry(req, res) {
        try {
            const { deviceId, voltage, current, activePowerWatts, cumulativeKwh } = req.body;
            if (!deviceId || typeof voltage !== 'number' || typeof current !== 'number') {
                return res.status(400).json({ success: false, message: 'Invalid telemetry payload' });
            }
            const telemetry = await repository_js_1.IotRepository.addTelemetry({
                deviceId,
                userId: req.user._id,
                timestamp: new Date(),
                voltage,
                current,
                activePowerWatts: activePowerWatts || voltage * current,
                cumulativeKwh: cumulativeKwh || 0,
                qualityStatus: 'valid',
            });
            return res.status(201).json({
                success: true,
                telemetry,
            });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to record IoT telemetry' });
        }
    },
    async getRecentTelemetry(req, res) {
        try {
            const limit = parseInt(req.query.limit || '50', 10);
            const data = await repository_js_1.IotRepository.getLatestTelemetry(req.user._id, limit);
            return res.status(200).json({
                success: true,
                data,
            });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: 'Failed to fetch telemetry' });
        }
    },
};
