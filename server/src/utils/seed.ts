import { UserRepository } from '../models/repository.js';
import { jsonStore } from './jsonStore.js';
import { TariffService } from '../services/tariffService.js';
import { connectDB } from '../config/database.js';

export async function seedDatabase() {
  console.log('[Seed] Initializing Enersense AI tariffs...');

  // 1. Seed Tariffs
  await TariffService.initializeDefaultTariffs();

  // 2. Clean up any previous demo user and mock/fake data
  try {
    const existingDemo = await UserRepository.findByEmail('demo@enersense.ai');
    if (existingDemo && existingDemo._id) {
      const demoId = existingDemo._id;
      console.log('[Seed] Purging demo user and fake history for:', demoId);
      await UserRepository.deleteById(demoId);
      jsonStore.deleteMany('meters', { userId: demoId });
      jsonStore.deleteMany('readings', { userId: demoId });
      jsonStore.deleteMany('bills', { userId: demoId });
      jsonStore.deleteMany('appliances', { userId: demoId });
      jsonStore.deleteMany('goals', { userId: demoId });
      jsonStore.deleteMany('recommendations', { userId: demoId });
      jsonStore.deleteMany('forecasts', { userId: demoId });
      console.log('[Seed] Demo account and fake history removed successfully.');
    }
  } catch (err) {
    console.warn('[Seed] Note during demo cleanup:', err);
  }

  console.log('[Seed] Database initialization complete (official tariffs only, zero fake data).');
}

if (process.argv[1] && process.argv[1].includes('seed.ts')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  })();
}
