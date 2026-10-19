"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const repository_js_1 = require("../models/repository.js");
const jsonStore_js_1 = require("./jsonStore.js");
const tariffService_js_1 = require("../services/tariffService.js");
const database_js_1 = require("../config/database.js");
async function seedDatabase() {
    console.log('[Seed] Initializing Enersense AI tariffs...');
    // 1. Seed Tariffs
    await tariffService_js_1.TariffService.initializeDefaultTariffs();
    // 2. Clean up any previous demo user and mock/fake data
    try {
        const existingDemo = await repository_js_1.UserRepository.findByEmail('demo@enersense.ai');
        if (existingDemo && existingDemo._id) {
            const demoId = existingDemo._id;
            console.log('[Seed] Purging demo user and fake history for:', demoId);
            await repository_js_1.UserRepository.deleteById(demoId);
            jsonStore_js_1.jsonStore.deleteMany('meters', { userId: demoId });
            jsonStore_js_1.jsonStore.deleteMany('readings', { userId: demoId });
            jsonStore_js_1.jsonStore.deleteMany('bills', { userId: demoId });
            jsonStore_js_1.jsonStore.deleteMany('appliances', { userId: demoId });
            jsonStore_js_1.jsonStore.deleteMany('goals', { userId: demoId });
            jsonStore_js_1.jsonStore.deleteMany('recommendations', { userId: demoId });
            jsonStore_js_1.jsonStore.deleteMany('forecasts', { userId: demoId });
            console.log('[Seed] Demo account and fake history removed successfully.');
        }
    }
    catch (err) {
        console.warn('[Seed] Note during demo cleanup:', err);
    }
    console.log('[Seed] Database initialization complete (official tariffs only, zero fake data).');
}
if (process.argv[1] && process.argv[1].includes('seed.ts')) {
    (async () => {
        await (0, database_js_1.connectDB)();
        await seedDatabase();
        process.exit(0);
    })();
}
