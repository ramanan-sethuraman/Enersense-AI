import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { IotRepository } from '../models/repository.js';

export const IotController = {
  async getDevices(req: AuthRequest, res: Response) {
    try {
      const devices = await IotRepository.getDevices(req.user!._id!);
      return res.status(200).json({
        success: true,
        count: devices.length,
        devices,
        note: 'Future Smart Meter & IoT Gateway layer. Enables direct connection with ESP32/Raspberry Pi current transformer sensors.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to retrieve IoT devices' });
    }
  },

  async registerDevice(req: AuthRequest, res: Response) {
    try {
      const { deviceId, deviceName, deviceType } = req.body;
      if (!deviceId || !deviceName) {
        return res.status(400).json({ success: false, message: 'Device ID and Name are required' });
      }

      const device = await IotRepository.createDevice({
        userId: req.user!._id!,
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
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to register IoT device' });
    }
  },

  async ingestTelemetry(req: AuthRequest, res: Response) {
    try {
      const { deviceId, voltage, current, activePowerWatts, cumulativeKwh } = req.body;
      if (!deviceId || typeof voltage !== 'number' || typeof current !== 'number') {
        return res.status(400).json({ success: false, message: 'Invalid telemetry payload' });
      }

      const telemetry = await IotRepository.addTelemetry({
        deviceId,
        userId: req.user!._id!,
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
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to record IoT telemetry' });
    }
  },

  async getRecentTelemetry(req: AuthRequest, res: Response) {
    try {
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const data = await IotRepository.getLatestTelemetry(req.user!._id!, limit);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch telemetry' });
    }
  },
};
