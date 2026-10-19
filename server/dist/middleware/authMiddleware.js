"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
const repository_js_1 = require("../models/repository.js");
async function requireAuth(req, res, next) {
    try {
        let token;
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in to proceed.',
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_js_1.config.jwtSecret);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired session token. Please log in again.',
            });
        }
        const user = await repository_js_1.UserRepository.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User account not found. Please log in again.',
            });
        }
        req.user = user;
        next();
    }
    catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Authentication session expired or invalid.',
        });
    }
}
async function optionalAuth(req, res, next) {
    try {
        let token;
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, env_js_1.config.jwtSecret);
                if (decoded && decoded.userId) {
                    const user = await repository_js_1.UserRepository.findById(decoded.userId);
                    if (user) {
                        req.user = user;
                    }
                }
            }
            catch (_) { }
        }
        next();
    }
    catch (_) {
        next();
    }
}
