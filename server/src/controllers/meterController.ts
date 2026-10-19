import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { MeterRepository, ReadingRepository } from '../models/repository.js';

const meterSchema = z.object({
  meterName: z.string().min(2, 'Meter name is required'),
  meterIdentifier: z.string().min(2, 'Meter number or identifier is required'),
  readingUnit: z.string().default('kWh'),
  location: z.string().optional(),
});

export const MeterController = {
  async getMeters(req: AuthRequest, res: Response) {
    try {
      const meters = await MeterRepository.findByUserId(req.user!._id!);
      return res.status(200).json({ success: true, meters });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch meters' });
    }
  },

  async createMeter(req: AuthRequest, res: Response) {
    try {
      const parsed = meterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: parsed.error.errors[0].message });
      }

      const meter = await MeterRepository.create({
        userId: req.user!._id!,
        meterName: parsed.data.meterName,
        meterIdentifier: parsed.data.meterIdentifier,
        readingUnit: parsed.data.readingUnit,
        location: parsed.data.location || 'Main Panel',
      });

      return res.status(201).json({ success: true, meter, message: 'Electricity meter registered successfully.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to create meter' });
    }
  },

  async getMeterById(req: AuthRequest, res: Response) {
    try {
      const meter = await MeterRepository.findById(req.params.id);
      if (!meter || meter.userId !== req.user!._id!) {
        return res.status(404).json({ success: false, message: 'Meter not found or unauthorized' });
      }
      return res.status(200).json({ success: true, meter });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Error retrieving meter' });
    }
  },

  async updateMeter(req: AuthRequest, res: Response) {
    try {
      const existing = await MeterRepository.findById(req.params.id);
      if (!existing || existing.userId !== req.user!._id!) {
        return res.status(404).json({ success: false, message: 'Meter not found or unauthorized' });
      }

      const updated = await MeterRepository.updateById(req.params.id, req.body);
      return res.status(200).json({ success: true, meter: updated, message: 'Meter updated successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Error updating meter' });
    }
  },

  async deleteMeter(req: AuthRequest, res: Response) {
    try {
      const existing = await MeterRepository.findById(req.params.id);
      if (!existing || existing.userId !== req.user!._id!) {
        return res.status(404).json({ success: false, message: 'Meter not found or unauthorized' });
      }

      await MeterRepository.deleteById(req.params.id);
      return res.status(200).json({ success: true, message: 'Meter removed successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Error deleting meter' });
    }
  },
};
