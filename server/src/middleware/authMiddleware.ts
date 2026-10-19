import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UserRepository } from '../models/repository.js';
import { IUser } from '../models/types.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.',
      });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.',
      });
    }

    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found. Please log in again.',
      });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: 'Authentication session expired or invalid.',
    });
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
        if (decoded && decoded.userId) {
          const user = await UserRepository.findById(decoded.userId);
          if (user) {
            req.user = user;
          }
        }
      } catch (_) {}
    }
    next();
  } catch (_) {
    next();
  }
}

