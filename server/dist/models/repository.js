"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IotRepository = exports.ForecastRepository = exports.SavingsGoalRepository = exports.RecommendationRepository = exports.BillRecordRepository = exports.ApplianceRepository = exports.TariffRepository = exports.ReadingRepository = exports.MeterRepository = exports.UserRepository = void 0;
const database_js_1 = require("../config/database.js");
const jsonStore_js_1 = require("../utils/jsonStore.js");
const schemas_js_1 = require("./schemas.js");
function cleanDoc(doc) {
    if (!doc)
        return doc;
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    if (obj._id && typeof obj._id !== 'string') {
        obj._id = obj._id.toString();
    }
    return obj;
}
function cleanDocs(docs) {
    return docs.map((d) => cleanDoc(d));
}
exports.UserRepository = {
    async findByEmail(email) {
        if (database_js_1.isMongoConnected) {
            const u = await schemas_js_1.UserModel.findOne({ email: email.toLowerCase() });
            return cleanDoc(u);
        }
        const u = jsonStore_js_1.jsonStore.findOne('users', { email: email.toLowerCase() });
        return u ? cleanDoc(u) : null;
    },
    async findById(id) {
        if (database_js_1.isMongoConnected) {
            const u = await schemas_js_1.UserModel.findById(id);
            return cleanDoc(u);
        }
        const u = jsonStore_js_1.jsonStore.findById('users', id);
        return u ? cleanDoc(u) : null;
    },
    async create(user) {
        if (database_js_1.isMongoConnected) {
            const created = await schemas_js_1.UserModel.create({
                ...user,
                email: user.email.toLowerCase(),
            });
            return cleanDoc(created);
        }
        const created = jsonStore_js_1.jsonStore.insert('users', {
            ...user,
            email: user.email.toLowerCase(),
        });
        return cleanDoc(created);
    },
    async updateById(id, update) {
        if (database_js_1.isMongoConnected) {
            const updated = await schemas_js_1.UserModel.findByIdAndUpdate(id, update, { new: true });
            return cleanDoc(updated);
        }
        const updated = jsonStore_js_1.jsonStore.updateById('users', id, update);
        return updated ? cleanDoc(updated) : null;
    },
    async deleteById(id) {
        if (database_js_1.isMongoConnected) {
            const res = await schemas_js_1.UserModel.findByIdAndDelete(id);
            return !!res;
        }
        return jsonStore_js_1.jsonStore.deleteById('users', id);
    },
};
exports.MeterRepository = {
    async findByUserId(userId) {
        if (database_js_1.isMongoConnected) {
            const meters = await schemas_js_1.MeterModel.find({ userId }).sort({ createdAt: -1 });
            return cleanDocs(meters);
        }
        const meters = jsonStore_js_1.jsonStore.find('meters', { userId });
        return cleanDocs(meters);
    },
    async findById(id) {
        if (database_js_1.isMongoConnected) {
            const meter = await schemas_js_1.MeterModel.findById(id);
            return cleanDoc(meter);
        }
        const meter = jsonStore_js_1.jsonStore.findById('meters', id);
        return meter ? cleanDoc(meter) : null;
    },
    async create(meter) {
        if (database_js_1.isMongoConnected) {
            const created = await schemas_js_1.MeterModel.create(meter);
            return cleanDoc(created);
        }
        const created = jsonStore_js_1.jsonStore.insert('meters', meter);
        return cleanDoc(created);
    },
    async updateById(id, update) {
        if (database_js_1.isMongoConnected) {
            const updated = await schemas_js_1.MeterModel.findByIdAndUpdate(id, update, { new: true });
            return cleanDoc(updated);
        }
        const updated = jsonStore_js_1.jsonStore.updateById('meters', id, update);
        return updated ? cleanDoc(updated) : null;
    },
    async deleteById(id) {
        if (database_js_1.isMongoConnected) {
            const res = await schemas_js_1.MeterModel.findByIdAndDelete(id);
            return !!res;
        }
        return jsonStore_js_1.jsonStore.deleteById('meters', id);
    },
};
exports.ReadingRepository = {
    async findByUserId(userId, filter = {}) {
        if (database_js_1.isMongoConnected) {
            const query = { userId, ...filter };
            const readings = await schemas_js_1.ReadingModel.find(query).sort({ readingDate: -1 });
            return cleanDocs(readings);
        }
        const readings = jsonStore_js_1.jsonStore.find('readings', { userId, ...filter });
        readings.sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
        return cleanDocs(readings);
    },
    async findByMeterId(meterId) {
        if (database_js_1.isMongoConnected) {
            const readings = await schemas_js_1.ReadingModel.find({ meterId }).sort({ readingDate: 1 });
            return cleanDocs(readings);
        }
        const readings = jsonStore_js_1.jsonStore.find('readings', { meterId });
        readings.sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());
        return cleanDocs(readings);
    },
    async findById(id) {
        if (database_js_1.isMongoConnected) {
            const reading = await schemas_js_1.ReadingModel.findById(id);
            return cleanDoc(reading);
        }
        const reading = jsonStore_js_1.jsonStore.findById('readings', id);
        return reading ? cleanDoc(reading) : null;
    },
    async create(reading) {
        if (database_js_1.isMongoConnected) {
            const created = await schemas_js_1.ReadingModel.create(reading);
            return cleanDoc(created);
        }
        const created = jsonStore_js_1.jsonStore.insert('readings', reading);
        return cleanDoc(created);
    },
    async updateById(id, update) {
        if (database_js_1.isMongoConnected) {
            const updated = await schemas_js_1.ReadingModel.findByIdAndUpdate(id, update, { new: true });
            return cleanDoc(updated);
        }
        const updated = jsonStore_js_1.jsonStore.updateById('readings', id, update);
        return updated ? cleanDoc(updated) : null;
    },
    async deleteById(id) {
        if (database_js_1.isMongoConnected) {
            const res = await schemas_js_1.ReadingModel.findByIdAndDelete(id);
            return !!res;
        }
        return jsonStore_js_1.jsonStore.deleteById('readings', id);
    },
};
exports.TariffRepository = {
    async getAll() {
        if (database_js_1.isMongoConnected) {
            const tariffs = await schemas_js_1.TariffModel.find({});
            return cleanDocs(tariffs);
        }
        const tariffs = jsonStore_js_1.jsonStore.find('tariffs');
        return cleanDocs(tariffs);
    },
    async findById(id) {
        if (database_js_1.isMongoConnected) {
            const tariff = await schemas_js_1.TariffModel.findById(id);
            return cleanDoc(tariff);
        }
        const tariff = jsonStore_js_1.jsonStore.findById('tariffs', id);
        return tariff ? cleanDoc(tariff) : null;
    },
    async findByStateAndDiscom(state, discom) {
        const query = { state };
        if (discom)
            query.distributionCompany = discom;
        if (database_js_1.isMongoConnected) {
            const tariff = await schemas_js_1.TariffModel.findOne(query);
            return cleanDoc(tariff);
        }
        const tariffs = jsonStore_js_1.jsonStore.find('tariffs', query);
        return tariffs.length > 0 ? cleanDoc(tariffs[0]) : null;
    },
    async create(tariff) {
        if (database_js_1.isMongoConnected) {
            const created = await schemas_js_1.TariffModel.create(tariff);
            return cleanDoc(created);
        }
        const created = jsonStore_js_1.jsonStore.insert('tariffs', tariff);
        return cleanDoc(created);
    },
    async deleteById(id) {
        if (database_js_1.isMongoConnected) {
            const res = await schemas_js_1.TariffModel.findByIdAndDelete(id);
            return !!res;
        }
        return jsonStore_js_1.jsonStore.deleteById('tariffs', id);
    },
};
exports.ApplianceRepository = {
    async findByUserId(userId) {
        if (database_js_1.isMongoConnected) {
            const apps = await schemas_js_1.ApplianceModel.find({ userId }).sort({ ratedPowerWatts: -1 });
            return cleanDocs(apps);
        }
        const apps = jsonStore_js_1.jsonStore.find('appliances', { userId });
        apps.sort((a, b) => (b.ratedPowerWatts * b.dailyOperatingHours) - (a.ratedPowerWatts * a.dailyOperatingHours));
        return cleanDocs(apps);
    },
    async findById(id) {
        if (database_js_1.isMongoConnected) {
            const app = await schemas_js_1.ApplianceModel.findById(id);
            return cleanDoc(app);
        }
        const app = jsonStore_js_1.jsonStore.findById('appliances', id);
        return app ? cleanDoc(app) : null;
    },
    async create(app) {
        if (database_js_1.isMongoConnected) {
            const created = await schemas_js_1.ApplianceModel.create(app);
            return cleanDoc(created);
        }
        const created = jsonStore_js_1.jsonStore.insert('appliances', app);
        return cleanDoc(created);
    },
    async updateById(id, update) {
        if (database_js_1.isMongoConnected) {
            const updated = await schemas_js_1.ApplianceModel.findByIdAndUpdate(id, update, { new: true });
            return cleanDoc(updated);
        }
        const updated = jsonStore_js_1.jsonStore.updateById('appliances', id, update);
        return updated ? cleanDoc(updated) : null;
    },
    async deleteById(id) {
        if (database_js_1.isMongoConnected) {
            const res = await schemas_js_1.ApplianceModel.findByIdAndDelete(id);
            return !!res;
        }
        return jsonStore_js_1.jsonStore.deleteById('appliances', id);
    },
};
exports.BillRecordRepository = {
    async findByUserId(userId) {
        if (database_js_1.isMongoConnected) {
            const bills = await schemas_js_1.BillRecordModel.find({ userId }).sort({ billingPeriodEnd: -1 });
            return cleanDocs(bills);
        }
        const bills = jsonStore_js_1.jsonStore.find('bills', { userId });
        bills.sort((a, b) => new Date(b.billingPeriodEnd).getTime() - new Date(a.billingPeriodEnd).getTime());
        return cleanDocs(bills);
    },
    async findById(id) {
        if (database_js_1.isMongoConnected) {
            const bill = await schemas_js_1.BillRecordModel.findById(id);
            return cleanDoc(bill);
        }
        const bill = jsonStore_js_1.jsonStore.findById('bills', id);
        return bill ? cleanDoc(bill) : null;
    },
    async create(bill) {
        if (database_js_1.isMongoConnected) {
            const created = await schemas_js_1.BillRecordModel.create(bill);
            return cleanDoc(created);
        }
        const created = jsonStore_js_1.jsonStore.insert('bills', bill);
        return cleanDoc(created);
    },
    async deleteById(id) {
        if (database_js_1.isMongoConnected) {
            const res = await schemas_js_1.BillRecordModel.findByIdAndDelete(id);
            return !!res;
        }
        return jsonStore_js_1.jsonStore.deleteById('bills', id);
    },
};
exports.RecommendationRepository = {
    async findByUserId(userId) {
        if (database_js_1.isMongoConnected) {
            const recs = await schemas_js_1.RecommendationModel.find({ userId }).sort({ createdAt: -1 });
            return cleanDocs(recs);
        }
        const recs = jsonStore_js_1.jsonStore.find('recommendations', { userId });
        recs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return cleanDocs(recs);
    },
    async create(rec) {
        if (database_js_1.isMongoConnected) {
            const created = await schemas_js_1.RecommendationModel.create(rec);
            return cleanDoc(created);
        }
        const created = jsonStore_js_1.jsonStore.insert('recommendations', rec);
        return cleanDoc(created);
    },
    async updateById(id, update) {
        if (database_js_1.isMongoConnected) {
            const updated = await schemas_js_1.RecommendationModel.findByIdAndUpdate(id, update, { new: true });
            return cleanDoc(updated);
        }
        const updated = jsonStore_js_1.jsonStore.updateById('recommendations', id, update);
        return updated ? cleanDoc(updated) : null;
    },
    async deleteMany(userId) {
        if (database_js_1.isMongoConnected) {
            const res = await schemas_js_1.RecommendationModel.deleteMany({ userId });
            return res.deletedCount || 0;
        }
        return jsonStore_js_1.jsonStore.deleteMany('recommendations', { userId });
    },
};
exports.SavingsGoalRepository = {
    async findByUserId(userId) {
        if (database_js_1.isMongoConnected) {
            const goals = await schemas_js_1.SavingsGoalModel.find({ userId }).sort({ deadline: 1 });
            return cleanDocs(goals);
        }
        const goals = jsonStore_js_1.jsonStore.find('goals', { userId });
        return cleanDocs(goals);
    },
    async findById(id) {
        if (database_js_1.isMongoConnected) {
            const goal = await schemas_js_1.SavingsGoalModel.findById(id);
            return cleanDoc(goal);
        }
        const goal = jsonStore_js_1.jsonStore.findById('goals', id);
        return goal ? cleanDoc(goal) : null;
    },
    async create(goal) {
        if (database_js_1.isMongoConnected) {
            const created = await schemas_js_1.SavingsGoalModel.create(goal);
            return cleanDoc(created);
        }
        const created = jsonStore_js_1.jsonStore.insert('goals', goal);
        return cleanDoc(created);
    },
    async updateById(id, update) {
        if (database_js_1.isMongoConnected) {
            const updated = await schemas_js_1.SavingsGoalModel.findByIdAndUpdate(id, update, { new: true });
            return cleanDoc(updated);
        }
        const updated = jsonStore_js_1.jsonStore.updateById('goals', id, update);
        return updated ? cleanDoc(updated) : null;
    },
    async deleteById(id) {
        if (database_js_1.isMongoConnected) {
            const res = await schemas_js_1.SavingsGoalModel.findByIdAndDelete(id);
            return !!res;
        }
        return jsonStore_js_1.jsonStore.deleteById('goals', id);
    },
};
exports.ForecastRepository = {
    async findByUserId(userId) {
        if (database_js_1.isMongoConnected) {
            const forecasts = await schemas_js_1.ForecastModel.find({ userId }).sort({ createdAt: -1 });
            return cleanDocs(forecasts);
        }
        const forecasts = jsonStore_js_1.jsonStore.find('forecasts', { userId });
        forecasts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return cleanDocs(forecasts);
    },
    async create(forecast) {
        if (database_js_1.isMongoConnected) {
            const created = await schemas_js_1.ForecastModel.create(forecast);
            return cleanDoc(created);
        }
        const created = jsonStore_js_1.jsonStore.insert('forecasts', forecast);
        return cleanDoc(created);
    },
};
exports.IotRepository = {
    async getDevices(userId) {
        if (database_js_1.isMongoConnected) {
            const devices = await schemas_js_1.IotDeviceModel.find({ userId });
            return cleanDocs(devices);
        }
        return cleanDocs(jsonStore_js_1.jsonStore.find('iot_devices', { userId }));
    },
    async createDevice(device) {
        if (database_js_1.isMongoConnected) {
            const created = await schemas_js_1.IotDeviceModel.create(device);
            return cleanDoc(created);
        }
        return cleanDoc(jsonStore_js_1.jsonStore.insert('iot_devices', device));
    },
    async addTelemetry(telemetry) {
        if (database_js_1.isMongoConnected) {
            const created = await schemas_js_1.IotTelemetryModel.create(telemetry);
            return cleanDoc(created);
        }
        return cleanDoc(jsonStore_js_1.jsonStore.insert('iot_telemetry', telemetry));
    },
    async getLatestTelemetry(userId, limit = 50) {
        if (database_js_1.isMongoConnected) {
            const telemetries = await schemas_js_1.IotTelemetryModel.find({ userId }).sort({ timestamp: -1 }).limit(limit);
            return cleanDocs(telemetries);
        }
        const items = jsonStore_js_1.jsonStore.find('iot_telemetry', { userId });
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return cleanDocs(items.slice(0, limit));
    },
};
