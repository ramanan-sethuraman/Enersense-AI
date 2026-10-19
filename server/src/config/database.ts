import mongoose from 'mongoose';
import { config } from './env.js';

export let isMongoConnected = false;

export async function connectDB(): Promise<void> {
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
