"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureInitialized = ensureInitialized;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_js_1 = require("./config/env.js");
const database_js_1 = require("./config/database.js");
const seed_js_1 = require("./utils/seed.js");
const errorMiddleware_js_1 = require("./middleware/errorMiddleware.js");
// Route imports
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const meterRoutes_js_1 = __importDefault(require("./routes/meterRoutes.js"));
const readingRoutes_js_1 = __importDefault(require("./routes/readingRoutes.js"));
const ocrRoutes_js_1 = __importDefault(require("./routes/ocrRoutes.js"));
const tariffRoutes_js_1 = __importDefault(require("./routes/tariffRoutes.js"));
const applianceRoutes_js_1 = __importDefault(require("./routes/applianceRoutes.js"));
const dashboardRoutes_js_1 = __importDefault(require("./routes/dashboardRoutes.js"));
const recommendationRoutes_js_1 = __importDefault(require("./routes/recommendationRoutes.js"));
const forecastRoutes_js_1 = __importDefault(require("./routes/forecastRoutes.js"));
const goalRoutes_js_1 = __importDefault(require("./routes/goalRoutes.js"));
const reportRoutes_js_1 = __importDefault(require("./routes/reportRoutes.js"));
const settingsRoutes_js_1 = __importDefault(require("./routes/settingsRoutes.js"));
const iotRoutes_js_1 = __importDefault(require("./routes/iotRoutes.js"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin)
            return callback(null, true);
        if (origin === env_js_1.config.clientUrl ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1') ||
            origin.startsWith('http://192.168.') ||
            origin.startsWith('http://10.') ||
            origin.startsWith('http://172.')) {
            return callback(null, true);
        }
        return callback(null, true); // Dev mode: allow network devices
    },
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '15mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '15mb' }));
// Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${Date.now() - start}ms)`);
    });
    next();
});
// Health Check (both /api/health, /health, /api, and root /)
const healthHandler = (_req, res) => {
    res.status(200).json({
        status: 'ok',
        brand: 'Enersense AI',
        tagline: 'Understand Your Energy. Predict Your Bill. Save More.',
        timestamp: new Date().toISOString(),
    });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/api', healthHandler);
app.get('/', healthHandler);
// Ensure DB and data store initialization for serverless / cold start
app.use(async (_req, _res, next) => {
    try {
        await ensureInitialized();
    }
    catch (err) {
        console.warn('[Enersense AI Server] Cold start init warning:', err);
    }
    next();
});
// Mount Routes under both /api and root prefix for bulletproof proxy/rewrite compatibility
const routePairs = [
    ['auth', authRoutes_js_1.default],
    ['meters', meterRoutes_js_1.default],
    ['readings', readingRoutes_js_1.default],
    ['meter-scanner', ocrRoutes_js_1.default],
    ['tariffs', tariffRoutes_js_1.default],
    ['appliances', applianceRoutes_js_1.default],
    ['dashboard', dashboardRoutes_js_1.default],
    ['recommendations', recommendationRoutes_js_1.default],
    ['forecast', forecastRoutes_js_1.default],
    ['goals', goalRoutes_js_1.default],
    ['reports', reportRoutes_js_1.default],
    ['settings', settingsRoutes_js_1.default],
    ['iot', iotRoutes_js_1.default],
];
for (const [prefix, router] of routePairs) {
    app.use(`/api/${prefix}`, router);
    app.use(`/${prefix}`, router);
}
// 404 Fallback for API routes (always return JSON, never HTML)
app.use('/api', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API route not found: ${req.method} ${req.originalUrl}`,
    });
});
// Error Handler
app.use(errorMiddleware_js_1.errorHandler);
// Initialization promise for serverless/cold-start environments
let isInitialized = false;
let initPromise = null;
async function ensureInitialized() {
    if (isInitialized)
        return;
    if (!initPromise) {
        initPromise = (async () => {
            try {
                await (0, database_js_1.connectDB)();
                await (0, seed_js_1.seedDatabase)();
                isInitialized = true;
            }
            catch (err) {
                console.error('[Enersense AI Server] Initialization error:', err);
            }
        })();
    }
    return initPromise;
}
// Start Server for standalone execution
async function startServer() {
    try {
        await ensureInitialized();
        app.listen(env_js_1.config.port, () => {
            console.log(`====================================================`);
            console.log(`Enersense AI Server running on port ${env_js_1.config.port}`);
            console.log(`Client URL: ${env_js_1.config.clientUrl}`);
            console.log(`====================================================`);
        });
    }
    catch (err) {
        console.error('[Enersense AI Server] Failed to start:', err);
        process.exit(1);
    }
}
// Only listen on a port when running locally (not on Vercel or in serverless production)
const isServerless = !!(process.env.VERCEL ||
    process.env.VERCEL_ENV ||
    process.env.NOW_REGION ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.NODE_ENV === 'production');
if (!isServerless && process.env.NODE_ENV !== 'test') {
    startServer();
}
// Support both ES module default and CommonJS module.exports for Vercel Serverless
if (typeof module !== 'undefined' && module.exports) {
    module.exports = app;
    module.exports.default = app;
}
exports.default = app;
