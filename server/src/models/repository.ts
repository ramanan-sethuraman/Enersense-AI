import { isMongoConnected } from '../config/database.js';
import { jsonStore } from '../utils/jsonStore.js';
import {
  UserModel,
  MeterModel,
  ReadingModel,
  TariffModel,
  ApplianceModel,
  BillRecordModel,
  RecommendationModel,
  SavingsGoalModel,
  ForecastModel,
  IotDeviceModel,
  IotTelemetryModel,
} from './schemas.js';
import {
  IUser,
  IMeter,
  IReading,
  ITariff,
  IAppliance,
  IBillRecord,
  IRecommendation,
  ISavingsGoal,
  IForecast,
  IIotDevice,
  IIotTelemetry,
} from './types.js';

function cleanDoc<T>(doc: any): T {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj._id && typeof obj._id !== 'string') {
    obj._id = obj._id.toString();
  }
  return obj as T;
}

function cleanDocs<T>(docs: any[]): T[] {
  return docs.map((d) => cleanDoc<T>(d));
}

export const UserRepository = {
  async findByEmail(email: string): Promise<IUser | null> {
    if (isMongoConnected) {
      const u = await UserModel.findOne({ email: email.toLowerCase() });
      return cleanDoc<IUser>(u);
    }
    const u = jsonStore.findOne('users', { email: email.toLowerCase() });
    return u ? cleanDoc<IUser>(u) : null;
  },

  async findById(id: string): Promise<IUser | null> {
    if (isMongoConnected) {
      const u = await UserModel.findById(id);
      return cleanDoc<IUser>(u);
    }
    const u = jsonStore.findById('users', id);
    return u ? cleanDoc<IUser>(u) : null;
  },

  async create(user: IUser): Promise<IUser> {
    if (isMongoConnected) {
      const created = await UserModel.create({
        ...user,
        email: user.email.toLowerCase(),
      });
      return cleanDoc<IUser>(created);
    }
    const created = jsonStore.insert('users', {
      ...user,
      email: user.email.toLowerCase(),
    });
    return cleanDoc<IUser>(created);
  },

  async updateById(id: string, update: Partial<IUser>): Promise<IUser | null> {
    if (isMongoConnected) {
      const updated = await UserModel.findByIdAndUpdate(id, update, { new: true });
      return cleanDoc<IUser>(updated);
    }
    const updated = jsonStore.updateById('users', id, update);
    return updated ? cleanDoc<IUser>(updated) : null;
  },

  async deleteById(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await UserModel.findByIdAndDelete(id);
      return !!res;
    }
    return jsonStore.deleteById('users', id);
  },
};

export const MeterRepository = {
  async findByUserId(userId: string): Promise<IMeter[]> {
    if (isMongoConnected) {
      const meters = await MeterModel.find({ userId }).sort({ createdAt: -1 });
      return cleanDocs<IMeter>(meters);
    }
    const meters = jsonStore.find('meters', { userId });
    return cleanDocs<IMeter>(meters);
  },

  async findById(id: string): Promise<IMeter | null> {
    if (isMongoConnected) {
      const meter = await MeterModel.findById(id);
      return cleanDoc<IMeter>(meter);
    }
    const meter = jsonStore.findById('meters', id);
    return meter ? cleanDoc<IMeter>(meter) : null;
  },

  async create(meter: IMeter): Promise<IMeter> {
    if (isMongoConnected) {
      const created = await MeterModel.create(meter);
      return cleanDoc<IMeter>(created);
    }
    const created = jsonStore.insert('meters', meter);
    return cleanDoc<IMeter>(created);
  },

  async updateById(id: string, update: Partial<IMeter>): Promise<IMeter | null> {
    if (isMongoConnected) {
      const updated = await MeterModel.findByIdAndUpdate(id, update, { new: true });
      return cleanDoc<IMeter>(updated);
    }
    const updated = jsonStore.updateById('meters', id, update);
    return updated ? cleanDoc<IMeter>(updated) : null;
  },

  async deleteById(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await MeterModel.findByIdAndDelete(id);
      return !!res;
    }
    return jsonStore.deleteById('meters', id);
  },
};

export const ReadingRepository = {
  async findByUserId(userId: string, filter: Record<string, any> = {}): Promise<IReading[]> {
    if (isMongoConnected) {
      const query: any = { userId, ...filter };
      const readings = await ReadingModel.find(query).sort({ readingDate: -1 });
      return cleanDocs<IReading>(readings);
    }
    const readings = jsonStore.find('readings', { userId, ...filter });
    readings.sort((a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime());
    return cleanDocs<IReading>(readings);
  },

  async findByMeterId(meterId: string): Promise<IReading[]> {
    if (isMongoConnected) {
      const readings = await ReadingModel.find({ meterId }).sort({ readingDate: 1 });
      return cleanDocs<IReading>(readings);
    }
    const readings = jsonStore.find('readings', { meterId });
    readings.sort((a, b) => new Date(a.readingDate).getTime() - new Date(b.readingDate).getTime());
    return cleanDocs<IReading>(readings);
  },

  async findById(id: string): Promise<IReading | null> {
    if (isMongoConnected) {
      const reading = await ReadingModel.findById(id);
      return cleanDoc<IReading>(reading);
    }
    const reading = jsonStore.findById('readings', id);
    return reading ? cleanDoc<IReading>(reading) : null;
  },

  async create(reading: IReading): Promise<IReading> {
    if (isMongoConnected) {
      const created = await ReadingModel.create(reading);
      return cleanDoc<IReading>(created);
    }
    const created = jsonStore.insert('readings', reading);
    return cleanDoc<IReading>(created);
  },

  async updateById(id: string, update: Partial<IReading>): Promise<IReading | null> {
    if (isMongoConnected) {
      const updated = await ReadingModel.findByIdAndUpdate(id, update, { new: true });
      return cleanDoc<IReading>(updated);
    }
    const updated = jsonStore.updateById('readings', id, update);
    return updated ? cleanDoc<IReading>(updated) : null;
  },

  async deleteById(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await ReadingModel.findByIdAndDelete(id);
      return !!res;
    }
    return jsonStore.deleteById('readings', id);
  },
};

export const TariffRepository = {
  async getAll(): Promise<ITariff[]> {
    if (isMongoConnected) {
      const tariffs = await TariffModel.find({});
      return cleanDocs<ITariff>(tariffs);
    }
    const tariffs = jsonStore.find('tariffs');
    return cleanDocs<ITariff>(tariffs);
  },

  async findById(id: string): Promise<ITariff | null> {
    if (isMongoConnected) {
      const tariff = await TariffModel.findById(id);
      return cleanDoc<ITariff>(tariff);
    }
    const tariff = jsonStore.findById('tariffs', id);
    return tariff ? cleanDoc<ITariff>(tariff) : null;
  },

  async findByStateAndDiscom(state: string, discom?: string): Promise<ITariff | null> {
    const query: any = { state };
    if (discom) query.distributionCompany = discom;
    if (isMongoConnected) {
      const tariff = await TariffModel.findOne(query);
      return cleanDoc<ITariff>(tariff);
    }
    const tariffs = jsonStore.find('tariffs', query);
    return tariffs.length > 0 ? cleanDoc<ITariff>(tariffs[0]) : null;
  },

  async create(tariff: ITariff): Promise<ITariff> {
    if (isMongoConnected) {
      const created = await TariffModel.create(tariff);
      return cleanDoc<ITariff>(created);
    }
    const created = jsonStore.insert('tariffs', tariff);
    return cleanDoc<ITariff>(created);
  },

  async deleteById(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await TariffModel.findByIdAndDelete(id);
      return !!res;
    }
    return jsonStore.deleteById('tariffs', id);
  },
};

export const ApplianceRepository = {
  async findByUserId(userId: string): Promise<IAppliance[]> {
    if (isMongoConnected) {
      const apps = await ApplianceModel.find({ userId }).sort({ ratedPowerWatts: -1 });
      return cleanDocs<IAppliance>(apps);
    }
    const apps = jsonStore.find('appliances', { userId });
    apps.sort((a, b) => (b.ratedPowerWatts * b.dailyOperatingHours) - (a.ratedPowerWatts * a.dailyOperatingHours));
    return cleanDocs<IAppliance>(apps);
  },

  async findById(id: string): Promise<IAppliance | null> {
    if (isMongoConnected) {
      const app = await ApplianceModel.findById(id);
      return cleanDoc<IAppliance>(app);
    }
    const app = jsonStore.findById('appliances', id);
    return app ? cleanDoc<IAppliance>(app) : null;
  },

  async create(app: IAppliance): Promise<IAppliance> {
    if (isMongoConnected) {
      const created = await ApplianceModel.create(app);
      return cleanDoc<IAppliance>(created);
    }
    const created = jsonStore.insert('appliances', app);
    return cleanDoc<IAppliance>(created);
  },

  async updateById(id: string, update: Partial<IAppliance>): Promise<IAppliance | null> {
    if (isMongoConnected) {
      const updated = await ApplianceModel.findByIdAndUpdate(id, update, { new: true });
      return cleanDoc<IAppliance>(updated);
    }
    const updated = jsonStore.updateById('appliances', id, update);
    return updated ? cleanDoc<IAppliance>(updated) : null;
  },

  async deleteById(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await ApplianceModel.findByIdAndDelete(id);
      return !!res;
    }
    return jsonStore.deleteById('appliances', id);
  },
};

export const BillRecordRepository = {
  async findByUserId(userId: string): Promise<IBillRecord[]> {
    if (isMongoConnected) {
      const bills = await BillRecordModel.find({ userId }).sort({ billingPeriodEnd: -1 });
      return cleanDocs<IBillRecord>(bills);
    }
    const bills = jsonStore.find('bills', { userId });
    bills.sort((a, b) => new Date(b.billingPeriodEnd).getTime() - new Date(a.billingPeriodEnd).getTime());
    return cleanDocs<IBillRecord>(bills);
  },

  async findById(id: string): Promise<IBillRecord | null> {
    if (isMongoConnected) {
      const bill = await BillRecordModel.findById(id);
      return cleanDoc<IBillRecord>(bill);
    }
    const bill = jsonStore.findById('bills', id);
    return bill ? cleanDoc<IBillRecord>(bill) : null;
  },

  async create(bill: IBillRecord): Promise<IBillRecord> {
    if (isMongoConnected) {
      const created = await BillRecordModel.create(bill);
      return cleanDoc<IBillRecord>(created);
    }
    const created = jsonStore.insert('bills', bill);
    return cleanDoc<IBillRecord>(created);
  },

  async deleteById(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await BillRecordModel.findByIdAndDelete(id);
      return !!res;
    }
    return jsonStore.deleteById('bills', id);
  },
};

export const RecommendationRepository = {
  async findByUserId(userId: string): Promise<IRecommendation[]> {
    if (isMongoConnected) {
      const recs = await RecommendationModel.find({ userId }).sort({ createdAt: -1 });
      return cleanDocs<IRecommendation>(recs);
    }
    const recs = jsonStore.find('recommendations', { userId });
    recs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return cleanDocs<IRecommendation>(recs);
  },

  async create(rec: IRecommendation): Promise<IRecommendation> {
    if (isMongoConnected) {
      const created = await RecommendationModel.create(rec);
      return cleanDoc<IRecommendation>(created);
    }
    const created = jsonStore.insert('recommendations', rec);
    return cleanDoc<IRecommendation>(created);
  },

  async updateById(id: string, update: Partial<IRecommendation>): Promise<IRecommendation | null> {
    if (isMongoConnected) {
      const updated = await RecommendationModel.findByIdAndUpdate(id, update, { new: true });
      return cleanDoc<IRecommendation>(updated);
    }
    const updated = jsonStore.updateById('recommendations', id, update);
    return updated ? cleanDoc<IRecommendation>(updated) : null;
  },

  async deleteMany(userId: string): Promise<number> {
    if (isMongoConnected) {
      const res = await RecommendationModel.deleteMany({ userId });
      return res.deletedCount || 0;
    }
    return jsonStore.deleteMany('recommendations', { userId });
  },
};

export const SavingsGoalRepository = {
  async findByUserId(userId: string): Promise<ISavingsGoal[]> {
    if (isMongoConnected) {
      const goals = await SavingsGoalModel.find({ userId }).sort({ deadline: 1 });
      return cleanDocs<ISavingsGoal>(goals);
    }
    const goals = jsonStore.find('goals', { userId });
    return cleanDocs<ISavingsGoal>(goals);
  },

  async findById(id: string): Promise<ISavingsGoal | null> {
    if (isMongoConnected) {
      const goal = await SavingsGoalModel.findById(id);
      return cleanDoc<ISavingsGoal>(goal);
    }
    const goal = jsonStore.findById('goals', id);
    return goal ? cleanDoc<ISavingsGoal>(goal) : null;
  },

  async create(goal: ISavingsGoal): Promise<ISavingsGoal> {
    if (isMongoConnected) {
      const created = await SavingsGoalModel.create(goal);
      return cleanDoc<ISavingsGoal>(created);
    }
    const created = jsonStore.insert('goals', goal);
    return cleanDoc<ISavingsGoal>(created);
  },

  async updateById(id: string, update: Partial<ISavingsGoal>): Promise<ISavingsGoal | null> {
    if (isMongoConnected) {
      const updated = await SavingsGoalModel.findByIdAndUpdate(id, update, { new: true });
      return cleanDoc<ISavingsGoal>(updated);
    }
    const updated = jsonStore.updateById('goals', id, update);
    return updated ? cleanDoc<ISavingsGoal>(updated) : null;
  },

  async deleteById(id: string): Promise<boolean> {
    if (isMongoConnected) {
      const res = await SavingsGoalModel.findByIdAndDelete(id);
      return !!res;
    }
    return jsonStore.deleteById('goals', id);
  },
};

export const ForecastRepository = {
  async findByUserId(userId: string): Promise<IForecast[]> {
    if (isMongoConnected) {
      const forecasts = await ForecastModel.find({ userId }).sort({ createdAt: -1 });
      return cleanDocs<IForecast>(forecasts);
    }
    const forecasts = jsonStore.find('forecasts', { userId });
    forecasts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return cleanDocs<IForecast>(forecasts);
  },

  async create(forecast: IForecast): Promise<IForecast> {
    if (isMongoConnected) {
      const created = await ForecastModel.create(forecast);
      return cleanDoc<IForecast>(created);
    }
    const created = jsonStore.insert('forecasts', forecast);
    return cleanDoc<IForecast>(created);
  },
};

export const IotRepository = {
  async getDevices(userId: string): Promise<IIotDevice[]> {
    if (isMongoConnected) {
      const devices = await IotDeviceModel.find({ userId });
      return cleanDocs<IIotDevice>(devices);
    }
    return cleanDocs<IIotDevice>(jsonStore.find('iot_devices', { userId }));
  },

  async createDevice(device: IIotDevice): Promise<IIotDevice> {
    if (isMongoConnected) {
      const created = await IotDeviceModel.create(device);
      return cleanDoc<IIotDevice>(created);
    }
    return cleanDoc<IIotDevice>(jsonStore.insert('iot_devices', device));
  },

  async addTelemetry(telemetry: IIotTelemetry): Promise<IIotTelemetry> {
    if (isMongoConnected) {
      const created = await IotTelemetryModel.create(telemetry);
      return cleanDoc<IIotTelemetry>(created);
    }
    return cleanDoc<IIotTelemetry>(jsonStore.insert('iot_telemetry', telemetry));
  },

  async getLatestTelemetry(userId: string, limit = 50): Promise<IIotTelemetry[]> {
    if (isMongoConnected) {
      const telemetries = await IotTelemetryModel.find({ userId }).sort({ timestamp: -1 }).limit(limit);
      return cleanDocs<IIotTelemetry>(telemetries);
    }
    const items = jsonStore.find('iot_telemetry', { userId });
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return cleanDocs<IIotTelemetry>(items.slice(0, limit));
  },
};
