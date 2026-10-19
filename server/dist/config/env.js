"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
try {
    if (typeof __dirname !== 'undefined') {
        dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
    }
}
catch { }
dotenv_1.default.config(); // fallback to current dir .env
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/enersense',
    jwtSecret: process.env.JWT_SECRET || 'enersense_ai_jwt_secret_dev_key_2026',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    ocrProvider: process.env.OCR_PROVIDER || 'tesseract',
    ocrApiKey: process.env.OCR_API_KEY || '',
    googleVisionApiKey: process.env.GOOGLE_VISION_API_KEY || process.env.OCR_API_KEY || '',
    aiProvider: process.env.AI_PROVIDER || 'gemini',
    aiApiKey: process.env.AI_API_KEY || '',
};
