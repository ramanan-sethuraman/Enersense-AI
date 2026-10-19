export interface IUser {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  locationPreferences?: {
    state: string;
    distributionCompany?: string;
    area?: string;
  };
  consumerCategory?: string;
  settings?: {
    theme?: 'light' | 'dark';
    currency?: string;
    energyUnit?: string;
    notificationsEnabled?: boolean;
    dataSharingConsent?: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMeter {
  _id?: string;
  userId: string;
  meterName: string;
  meterIdentifier: string;
  readingUnit: string;
  location?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReading {
  _id?: string;
  userId: string;
  meterId: string;
  readingValue: number;
  readingDate: Date | string;
  source: 'manual' | 'ocr' | 'iot';
  verificationStatus: 'verified' | 'pending' | 'flagged';
  confidence?: number;
  imageUrl?: string;
  notes?: string;
  unitsConsumed?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITariffSlab {
  minUnits: number;
  maxUnits: number | null; // null means and above
  ratePerUnit: number;
}

export interface ISubsidy {
  name: string;
  discountAmount?: number;
  discountPercent?: number;
  maxEligibleUnits?: number;
}

export interface ITariffConditionalTier {
  condition: 'upto_500' | 'above_500' | string;
  thresholdUnits: number;
  title: string;
  slabs: ITariffSlab[];
}

export interface ITariff {
  _id?: string;
  state: string;
  distributionCompany: string;
  consumerCategory: string;
  tariffName: string;
  calculationMethod: 'progressive_slab' | 'flat_rate' | 'conditional_tiers';
  tariffSlabs: ITariffSlab[];
  conditionalTiers?: ITariffConditionalTier[];
  fixedCharges: number;
  otherCharges: number; // e.g. electricity duty, fuel adjustment charge % or amount
  subsidies?: ISubsidy[];
  effectiveFrom?: string;
  effectiveTo?: string;
  sourceDescription?: string;
  createdAt?: Date;
}

export interface IAppliance {
  _id?: string;
  userId: string;
  name: string;
  category: string;
  ratedPowerWatts: number;
  quantity: number;
  dailyOperatingHours: number;
  operatingDaysPerMonth: number;
  standbyPowerWatts?: number;
  usageSchedule?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBillRecord {
  _id?: string;
  userId: string;
  meterId?: string;
  billingPeriodStart: Date | string;
  billingPeriodEnd: Date | string;
  previousReading?: number;
  currentReading?: number;
  unitsConsumed: number;
  tariffConfiguration: {
    tariffName: string;
    state: string;
    distributionCompany: string;
    fixedCharges: number;
    calculationMethod: string;
  };
  energyCharges: number;
  fixedCharges: number;
  otherCharges: number;
  adjustments: number;
  estimatedTotal: number;
  calculationBreakdown?: Array<{
    slab: string;
    units: number;
    rate: number;
    amount: number;
  }>;
  createdAt?: Date;
}

export interface IRecommendation {
  _id?: string;
  userId: string;
  title: string;
  description: string;
  recommendationType: 'appliance' | 'behavior' | 'tariff' | 'maintenance';
  calculationAssumptions?: string;
  estimatedEnergySavings?: number; // kWh
  estimatedCostSavings?: number; // ₹
  confidence?: 'high' | 'medium' | 'estimated';
  status?: 'active' | 'implemented' | 'dismissed';
  createdAt?: Date;
}

export interface ISavingsGoal {
  _id?: string;
  userId: string;
  name: string;
  baselineConsumption: number;
  targetConsumption: number;
  targetPeriod: string; // e.g., 'October 2026'
  deadline: Date | string;
  status: 'in_progress' | 'achieved' | 'missed';
  currentProgress?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IForecast {
  _id?: string;
  userId: string;
  forecastPeriod: string;
  predictedConsumption: number;
  predictedBill: number;
  assumptions: string[];
  uncertaintyInformation?: string;
  createdAt?: Date;
}

export interface IIotDevice {
  _id?: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'smart_meter' | 'current_transformer' | 'smart_plug' | 'esp32_gateway';
  status: 'online' | 'offline' | 'pairing';
  lastSeen?: Date | string;
  firmwareVersion?: string;
  createdAt?: Date;
}

export interface IIotTelemetry {
  _id?: string;
  deviceId: string;
  userId: string;
  timestamp: Date | string;
  voltage: number;
  current: number;
  activePowerWatts: number;
  cumulativeKwh: number;
  qualityStatus: 'valid' | 'degraded' | 'estimated';
}
