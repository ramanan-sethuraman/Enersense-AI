import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { connectDB } from './config/database.js';
import { seedDatabase } from './utils/seed.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import meterRoutes from './routes/meterRoutes.js';
import readingRoutes from './routes/readingRoutes.js';
import ocrRoutes from './routes/ocrRoutes.js';
import tariffRoutes from './routes/tariffRoutes.js';
import applianceRoutes from './routes/applianceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import forecastRoutes from './routes/forecastRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import iotRoutes from './routes/iotRoutes.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (
        origin === config.clientUrl ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.') ||
        origin.startsWith('http://172.')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Dev mode: allow network devices
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Health Check (both /api/health, /health, /api, and root /)
const healthHandler = (_req: express.Request, res: express.Response) => {
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
  } catch (err) {
    console.warn('[Enersense AI Server] Cold start init warning:', err);
  }
  next();
});

// Mount Routes under both /api and root prefix for bulletproof proxy/rewrite compatibility
const routePairs: [string, any][] = [
  ['auth', authRoutes],
  ['meters', meterRoutes],
  ['readings', readingRoutes],
  ['meter-scanner', ocrRoutes],
  ['tariffs', tariffRoutes],
  ['appliances', applianceRoutes],
  ['dashboard', dashboardRoutes],
  ['recommendations', recommendationRoutes],
  ['forecast', forecastRoutes],
  ['goals', goalRoutes],
  ['reports', reportRoutes],
  ['settings', settingsRoutes],
  ['iot', iotRoutes],
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
app.use(errorHandler);

// Initialization promise for serverless/cold-start environments
let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureInitialized() {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await connectDB();
        await seedDatabase();
        isInitialized = true;
      } catch (err) {
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

    app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`Enersense AI Server running on port ${config.port}`);
      console.log(`Client URL: ${config.clientUrl}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('[Enersense AI Server] Failed to start:', err);
    process.exit(1);
  }
}

// Only start listening if run directly (not under Vercel serverless functions or tests)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer();
}

// Support both ES module default and CommonJS module.exports for Vercel Serverless
if (typeof module !== 'undefined' && module.exports) {
  (module as any).exports = app;
  (module as any).exports.default = app;
}

export default app;
