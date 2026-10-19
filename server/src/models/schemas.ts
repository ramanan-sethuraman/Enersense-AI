import mongoose, { Schema } from 'mongoose';
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

// User Schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    locationPreferences: {
      state: { type: String, default: 'Tamil Nadu' },
      distributionCompany: { type: String, default: 'TANGEDCO' },
      area: { type: String, default: '' },
    },
    consumerCategory: { type: String, default: 'Domestic Low Tension' },
    settings: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      currency: { type: String, default: '₹' },
      energyUnit: { type: String, default: 'kWh' },
      notificationsEnabled: { type: Boolean, default: true },
      dataSharingConsent: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Meter Schema
const MeterSchema = new Schema<IMeter>(
  {
    userId: { type: String, required: true, index: true },
    meterName: { type: String, required: true },
    meterIdentifier: { type: String, required: true },
    readingUnit: { type: String, default: 'kWh' },
    location: { type: String, default: 'Main Panel' },
  },
  { timestamps: true }
);

// Reading Schema
const ReadingSchema = new Schema<IReading>(
  {
    userId: { type: String, required: true, index: true },
    meterId: { type: String, required: true, index: true },
    readingValue: { type: Number, required: true },
    readingDate: { type: Date, required: true },
    source: { type: String, enum: ['manual', 'ocr', 'iot'], default: 'manual' },
    verificationStatus: { type: String, enum: ['verified', 'pending', 'flagged'], default: 'verified' },
    confidence: { type: Number, default: 100 },
    imageUrl: { type: String },
    notes: { type: String },
    unitsConsumed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Tariff Schema
const TariffSchema = new Schema<ITariff>(
  {
    state: { type: String, required: true },
    distributionCompany: { type: String, required: true },
    consumerCategory: { type: String, required: true },
    tariffName: { type: String, required: true },
    calculationMethod: { type: String, enum: ['progressive_slab', 'flat_rate'], default: 'progressive_slab' },
    tariffSlabs: [
      {
        minUnits: { type: Number, required: true },
        maxUnits: { type: Number, default: null },
        ratePerUnit: { type: Number, required: true },
      },
    ],
    fixedCharges: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    subsidies: [
      {
        name: { type: String },
        discountAmount: { type: Number },
        discountPercent: { type: Number },
        maxEligibleUnits: { type: Number },
      },
    ],
    effectiveFrom: { type: String },
    effectiveTo: { type: String },
    sourceDescription: { type: String },
  },
  { timestamps: true }
);

// Appliance Schema
const ApplianceSchema = new Schema<IAppliance>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    ratedPowerWatts: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    dailyOperatingHours: { type: Number, required: true },
    operatingDaysPerMonth: { type: Number, default: 30 },
    standbyPowerWatts: { type: Number, default: 0 },
    usageSchedule: { type: String },
  },
  { timestamps: true }
);

// BillRecord Schema
const BillRecordSchema = new Schema<IBillRecord>(
  {
    userId: { type: String, required: true, index: true },
    meterId: { type: String },
    billingPeriodStart: { type: Date, required: true },
    billingPeriodEnd: { type: Date, required: true },
    previousReading: { type: Number },
    currentReading: { type: Number },
    unitsConsumed: { type: Number, required: true },
    tariffConfiguration: {
      tariffName: { type: String, required: true },
      state: { type: String, required: true },
      distributionCompany: { type: String, required: true },
      fixedCharges: { type: Number, default: 0 },
      calculationMethod: { type: String, default: 'progressive_slab' },
    },
    energyCharges: { type: Number, required: true },
    fixedCharges: { type: Number, required: true },
    otherCharges: { type: Number, default: 0 },
    adjustments: { type: Number, default: 0 },
    estimatedTotal: { type: Number, required: true },
    calculationBreakdown: [
      {
        slab: { type: String },
        units: { type: Number },
        rate: { type: Number },
        amount: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

// Recommendation Schema
const RecommendationSchema = new Schema<IRecommendation>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    recommendationType: { type: String, enum: ['appliance', 'behavior', 'tariff', 'maintenance'], default: 'appliance' },
    calculationAssumptions: { type: String },
    estimatedEnergySavings: { type: Number, default: 0 },
    estimatedCostSavings: { type: Number, default: 0 },
    confidence: { type: String, enum: ['high', 'medium', 'estimated'], default: 'medium' },
    status: { type: String, enum: ['active', 'implemented', 'dismissed'], default: 'active' },
  },
  { timestamps: true }
);

// SavingsGoal Schema
const SavingsGoalSchema = new Schema<ISavingsGoal>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    baselineConsumption: { type: Number, required: true },
    targetConsumption: { type: Number, required: true },
    targetPeriod: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['in_progress', 'achieved', 'missed'], default: 'in_progress' },
    currentProgress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Forecast Schema
const ForecastSchema = new Schema<IForecast>(
  {
    userId: { type: String, required: true, index: true },
    forecastPeriod: { type: String, required: true },
    predictedConsumption: { type: Number, required: true },
    predictedBill: { type: Number, required: true },
    assumptions: [{ type: String }],
    uncertaintyInformation: { type: String },
  },
  { timestamps: true }
);

// IoT Schemas
const IotDeviceSchema = new Schema<IIotDevice>(
  {
    userId: { type: String, required: true, index: true },
    deviceId: { type: String, required: true, unique: true },
    deviceName: { type: String, required: true },
    deviceType: { type: String, enum: ['smart_meter', 'current_transformer', 'smart_plug', 'esp32_gateway'], default: 'smart_meter' },
    status: { type: String, enum: ['online', 'offline', 'pairing'], default: 'offline' },
    lastSeen: { type: Date },
    firmwareVersion: { type: String, default: 'v1.0.0' },
  },
  { timestamps: true }
);

const IotTelemetrySchema = new Schema<IIotTelemetry>(
  {
    deviceId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    voltage: { type: Number, required: true },
    current: { type: Number, required: true },
    activePowerWatts: { type: Number, required: true },
    cumulativeKwh: { type: Number, required: true },
    qualityStatus: { type: String, enum: ['valid', 'degraded', 'estimated'], default: 'valid' },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const MeterModel = mongoose.models.Meter || mongoose.model<IMeter>('Meter', MeterSchema);
export const ReadingModel = mongoose.models.Reading || mongoose.model<IReading>('Reading', ReadingSchema);
export const TariffModel = mongoose.models.Tariff || mongoose.model<ITariff>('Tariff', TariffSchema);
export const ApplianceModel = mongoose.models.Appliance || mongoose.model<IAppliance>('Appliance', ApplianceSchema);
export const BillRecordModel = mongoose.models.BillRecord || mongoose.model<IBillRecord>('BillRecord', BillRecordSchema);
export const RecommendationModel = mongoose.models.Recommendation || mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
export const SavingsGoalModel = mongoose.models.SavingsGoal || mongoose.model<ISavingsGoal>('SavingsGoal', SavingsGoalSchema);
export const ForecastModel = mongoose.models.Forecast || mongoose.model<IForecast>('Forecast', ForecastSchema);
export const IotDeviceModel = mongoose.models.IotDevice || mongoose.model<IIotDevice>('IotDevice', IotDeviceSchema);
export const IotTelemetryModel = mongoose.models.IotTelemetry || mongoose.model<IIotTelemetry>('IotTelemetry', IotTelemetrySchema);
