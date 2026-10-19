import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/env.js';
import { UserRepository, MeterRepository } from '../models/repository.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  state: z.string().default('Maharashtra'),
  distributionCompany: z.string().optional(),
  area: z.string().optional(),
  consumerCategory: z.string().default('LT-I Residential'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

function signToken(userId: string): string {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

function sendAuthCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.errors[0]?.message || 'Validation error',
        });
      }

      const { name, email, password, state, distributionCompany, area, consumerCategory } = parsed.data;

      const existing = await UserRepository.findByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await UserRepository.create({
        name,
        email,
        passwordHash,
        locationPreferences: {
          state: state || 'Tamil Nadu',
          distributionCompany: distributionCompany || 'TANGEDCO',
          area: area || '',
        },
        consumerCategory,
        settings: {
          theme: 'light',
          currency: '₹',
          energyUnit: 'kWh',
          notificationsEnabled: true,
          dataSharingConsent: false,
        },
      });

      // Auto-provision a default meter for seamless onboarding
      if (user._id) {
        await MeterRepository.create({
          userId: user._id,
          meterName: 'Main Residential Meter',
          meterIdentifier: 'MTR-' + Math.floor(100000 + Math.random() * 900000),
          readingUnit: 'kWh',
          location: 'Home Main Panel',
        });
      }

      const token = signToken(user._id!);
      sendAuthCookie(res, token);

      const { passwordHash: _, ...safeUser } = user;
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully. Welcome to Enersense AI!',
        token,
        user: safeUser,
      });
    } catch (err: any) {
      console.error('[AuthController.register] Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Registration failed due to server error.',
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: parsed.error.errors[0]?.message || 'Validation error',
        });
      }

      const { email, password } = parsed.data;
      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email address or password.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email address or password.',
        });
      }

      const token = signToken(user._id!);
      sendAuthCookie(res, token);

      const { passwordHash: _, ...safeUser } = user;
      return res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: safeUser,
      });
    } catch (err: any) {
      console.error('[AuthController.login] Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Login failed due to an unexpected error.',
      });
    }
  },

  async logout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  },

  async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const { passwordHash: _, ...safeUser } = req.user;
    const meters = await MeterRepository.findByUserId(req.user._id!);
    return res.status(200).json({
      success: true,
      user: safeUser,
      meters,
    });
  },
};
