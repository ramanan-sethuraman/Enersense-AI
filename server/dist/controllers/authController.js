"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const env_js_1 = require("../config/env.js");
const repository_js_1 = require("../models/repository.js");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    state: zod_1.z.string().default('Maharashtra'),
    distributionCompany: zod_1.z.string().optional(),
    area: zod_1.z.string().optional(),
    consumerCategory: zod_1.z.string().default('LT-I Residential'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Please enter a valid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
function signToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, env_js_1.config.jwtSecret, {
        expiresIn: env_js_1.config.jwtExpiresIn,
    });
}
function sendAuthCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: env_js_1.config.nodeEnv === 'production',
        sameSite: env_js_1.config.nodeEnv === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}
exports.AuthController = {
    async register(req, res) {
        try {
            const parsed = registerSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: parsed.error.errors[0]?.message || 'Validation error',
                });
            }
            const { name, email, password, state, distributionCompany, area, consumerCategory } = parsed.data;
            const existing = await repository_js_1.UserRepository.findByEmail(email);
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'An account with this email address already exists. Please log in.',
                });
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            const passwordHash = await bcryptjs_1.default.hash(password, salt);
            const user = await repository_js_1.UserRepository.create({
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
                await repository_js_1.MeterRepository.create({
                    userId: user._id,
                    meterName: 'Main Residential Meter',
                    meterIdentifier: 'MTR-' + Math.floor(100000 + Math.random() * 900000),
                    readingUnit: 'kWh',
                    location: 'Home Main Panel',
                });
            }
            const token = signToken(user._id);
            sendAuthCookie(res, token);
            const { passwordHash: _, ...safeUser } = user;
            return res.status(201).json({
                success: true,
                message: 'Account registered successfully. Welcome to Enersense AI!',
                token,
                user: safeUser,
            });
        }
        catch (err) {
            console.error('[AuthController.register] Error:', err);
            return res.status(500).json({
                success: false,
                message: 'Registration failed due to server error.',
            });
        }
    },
    async login(req, res) {
        try {
            const parsed = loginSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: parsed.error.errors[0]?.message || 'Validation error',
                });
            }
            const { email, password } = parsed.data;
            const user = await repository_js_1.UserRepository.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email address or password.',
                });
            }
            const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email address or password.',
                });
            }
            const token = signToken(user._id);
            sendAuthCookie(res, token);
            const { passwordHash: _, ...safeUser } = user;
            return res.status(200).json({
                success: true,
                message: 'Logged in successfully.',
                token,
                user: safeUser,
            });
        }
        catch (err) {
            console.error('[AuthController.login] Error:', err);
            return res.status(500).json({
                success: false,
                message: 'Login failed due to an unexpected error.',
            });
        }
    },
    async logout(req, res) {
        res.clearCookie('token');
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully.',
        });
    },
    async me(req, res) {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const { passwordHash: _, ...safeUser } = req.user;
        const meters = await repository_js_1.MeterRepository.findByUserId(req.user._id);
        return res.status(200).json({
            success: true,
            user: safeUser,
            meters,
        });
    },
};
