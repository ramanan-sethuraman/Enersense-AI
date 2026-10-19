"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
    console.error(`[Error] ${req.method} ${req.url} - Status ${statusCode}:`, err.message || err);
    res.status(statusCode).json({
        success: false,
        message: err.message || 'An unexpected internal server error occurred.',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}
