import mongoose from 'mongoose';
import { config } from './env.js';

export let isMongoConnected = false;

export async function connectDB(): Promise<void> {
  const isServerless = !!(process.env.VERCEL || process.env.VERCEL_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === 'production');
  const isLocalMongo = !config.mongoUri || config.mongoUri.includes('localhost') || config.mongoUri.includes('127.0.0.1');

  if (isServerless && isLocalMongo) {
    isMongoConnected = false;
    console.log('[Database] Serverless/Production environment without remote Mongo URI. Operating with resilient JsonStore.');
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    // Short timeout so if local mongod is not present, it fails quickly and switches to JsonStore fallback gracefully!
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log('[Database] Connected to MongoDB at:', config.mongoUri);
  } catch (err: any) {
    isMongoConnected = false;
    console.warn('[Database] MongoDB connection failed or not available:', err.message);
    console.log('[Database] Running with robust file-persisted JSON data store fallback.');
  }
}
