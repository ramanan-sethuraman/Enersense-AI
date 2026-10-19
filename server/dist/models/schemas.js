"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.IotTelemetryModel = exports.IotDeviceModel = exports.ForecastModel = exports.SavingsGoalModel = exports.RecommendationModel = exports.BillRecordModel = exports.ApplianceModel = exports.TariffModel = exports.ReadingModel = exports.MeterModel = exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// User Schema
const UserSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
// Meter Schema
const MeterSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    meterName: { type: String, required: true },
    meterIdentifier: { type: String, required: true },
    readingUnit: { type: String, default: 'kWh' },
    location: { type: String, default: 'Main Panel' },
}, { timestamps: true });
// Reading Schema
const ReadingSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
// Tariff Schema
const TariffSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
// Appliance Schema
const ApplianceSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    ratedPowerWatts: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    dailyOperatingHours: { type: Number, required: true },
    operatingDaysPerMonth: { type: Number, default: 30 },
    standbyPowerWatts: { type: Number, default: 0 },
    usageSchedule: { type: String },
}, { timestamps: true });
// BillRecord Schema
const BillRecordSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
// Recommendation Schema
const RecommendationSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    recommendationType: { type: String, enum: ['appliance', 'behavior', 'tariff', 'maintenance'], default: 'appliance' },
    calculationAssumptions: { type: String },
    estimatedEnergySavings: { type: Number, default: 0 },
    estimatedCostSavings: { type: Number, default: 0 },
    confidence: { type: String, enum: ['high', 'medium', 'estimated'], default: 'medium' },
    status: { type: String, enum: ['active', 'implemented', 'dismissed'], default: 'active' },
}, { timestamps: true });
// SavingsGoal Schema
const SavingsGoalSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    baselineConsumption: { type: Number, required: true },
    targetConsumption: { type: Number, required: true },
    targetPeriod: { type: String, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['in_progress', 'achieved', 'missed'], default: 'in_progress' },
    currentProgress: { type: Number, default: 0 },
}, { timestamps: true });
// Forecast Schema
const ForecastSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    forecastPeriod: { type: String, required: true },
    predictedConsumption: { type: Number, required: true },
    predictedBill: { type: Number, required: true },
    assumptions: [{ type: String }],
    uncertaintyInformation: { type: String },
}, { timestamps: true });
// IoT Schemas
const IotDeviceSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, index: true },
    deviceId: { type: String, required: true, unique: true },
    deviceName: { type: String, required: true },
    deviceType: { type: String, enum: ['smart_meter', 'current_transformer', 'smart_plug', 'esp32_gateway'], default: 'smart_meter' },
    status: { type: String, enum: ['online', 'offline', 'pairing'], default: 'offline' },
    lastSeen: { type: Date },
    firmwareVersion: { type: String, default: 'v1.0.0' },
}, { timestamps: true });
const IotTelemetrySchema = new mongoose_1.Schema({
    deviceId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    timestamp: { type: Date, required: true },
    voltage: { type: Number, required: true },
    current: { type: Number, required: true },
    activePowerWatts: { type: Number, required: true },
    cumulativeKwh: { type: Number, required: true },
    qualityStatus: { type: String, enum: ['valid', 'degraded', 'estimated'], default: 'valid' },
}, { timestamps: true });
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model('User', UserSchema);
exports.MeterModel = mongoose_1.default.models.Meter || mongoose_1.default.model('Meter', MeterSchema);
exports.ReadingModel = mongoose_1.default.models.Reading || mongoose_1.default.model('Reading', ReadingSchema);
exports.TariffModel = mongoose_1.default.models.Tariff || mongoose_1.default.model('Tariff', TariffSchema);
exports.ApplianceModel = mongoose_1.default.models.Appliance || mongoose_1.default.model('Appliance', ApplianceSchema);
exports.BillRecordModel = mongoose_1.default.models.BillRecord || mongoose_1.default.model('BillRecord', BillRecordSchema);
exports.RecommendationModel = mongoose_1.default.models.Recommendation || mongoose_1.default.model('Recommendation', RecommendationSchema);
exports.SavingsGoalModel = mongoose_1.default.models.SavingsGoal || mongoose_1.default.model('SavingsGoal', SavingsGoalSchema);
exports.ForecastModel = mongoose_1.default.models.Forecast || mongoose_1.default.model('Forecast', ForecastSchema);
exports.IotDeviceModel = mongoose_1.default.models.IotDevice || mongoose_1.default.model('IotDevice', IotDeviceSchema);
exports.IotTelemetryModel = mongoose_1.default.models.IotTelemetry || mongoose_1.default.model('IotTelemetry', IotTelemetrySchema);
