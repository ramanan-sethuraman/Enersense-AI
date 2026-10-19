"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMongoConnected = void 0;
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./env.js");
exports.isMongoConnected = false;
async function connectDB() {
    const isServerless = !!(process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production');
    const isLocalMongo = !env_js_1.config.mongoUri || env_js_1.config.mongoUri.includes('localhost') || env_js_1.config.mongoUri.includes('127.0.0.1');
    if (isServerless && isLocalMongo) {
        exports.isMongoConnected = false;
        console.log('[Database] Serverless/Production environment without remote Mongo URI. Operating with resilient JsonStore.');
        return;
    }
    try {
        mongoose_1.default.set('strictQuery', false);
        // Short timeout so if local mongod is not present, it fails quickly and switches to JsonStore fallback gracefully!
        await mongoose_1.default.connect(env_js_1.config.mongoUri, {
            serverSelectionTimeoutMS: 2000,
        });
        exports.isMongoConnected = true;
        console.log('[Database] Connected to MongoDB at:', env_js_1.config.mongoUri);
    }
    catch (err) {
        exports.isMongoConnected = false;
        console.warn('[Database] MongoDB connection failed or not available:', err.message);
        console.log('[Database] Running with robust file-persisted JSON data store fallback.');
    }
}
