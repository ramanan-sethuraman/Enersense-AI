export interface User {
  _id: string;
  name: string;
  email: string;
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
}

export interface Meter {
  _id: string;
  userId: string;
  meterName: string;
  meterIdentifier: string;
  readingUnit: string;
  location?: string;
  createdAt?: string;
}

export interface Reading {
  _id: string;
  userId: string;
  meterId: string;
  readingValue: number;
  readingDate: string;
  source: 'manual' | 'ocr' | 'iot';
  verificationStatus: 'verified' | 'pending' | 'flagged';
  confidence?: number;
  imageUrl?: string;
  notes?: string;
  unitsConsumed?: number;
  createdAt?: string;
}

export interface TariffSlab {
  minUnits: number;
  maxUnits: number | null;
  ratePerUnit: number;
}

export interface TariffConditionalTier {
  condition: string;
  thresholdUnits: number;
  title: string;
  slabs: TariffSlab[];
}

export interface Tariff {
  _id: string;
  state: string;
  distributionCompany: string;
  consumerCategory: string;
  tariffName: string;
  calculationMethod: 'progressive_slab' | 'flat_rate' | 'conditional_tiers';
  tariffSlabs: TariffSlab[];
  conditionalTiers?: TariffConditionalTier[];
  fixedCharges: number;
  otherCharges: number;
  sourceDescription?: string;
}

export interface BillBreakdownItem {
  slab: string;
  units: number;
  rate: number;
  amount: number;
}

export interface BillEstimate {
  unitsConsumed: number;
  energyCharges: number;
  fixedCharges: number;
  otherCharges: number;
  adjustments: number;
  estimatedTotal: number;
  calculationBreakdown: BillBreakdownItem[];
  disclaimer: string;
}

export interface BillRecord {
  _id: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  previousReading?: number;
  currentReading?: number;
  unitsConsumed: number;
  tariffConfiguration: {
    tariffName: string;
    state: string;
    distributionCompany: string;
    fixedCharges: number;
  };
  energyCharges: number;
  fixedCharges: number;
  otherCharges: number;
  adjustments: number;
  estimatedTotal: number;
  calculationBreakdown?: BillBreakdownItem[];
  createdAt: string;
}

export interface Appliance {
  _id: string;
  name: string;
  category: string;
  ratedPowerWatts: number;
  quantity: number;
  dailyOperatingHours: number;
  operatingDaysPerMonth: number;
  standbyPowerWatts?: number;
  usageSchedule?: string;
  dailyKwh?: number;
  monthlyKwh?: number;
  monthlyCost?: number;
  percentageOfTotal?: number;
}

export interface Recommendation {
  _id: string;
  title: string;
  description: string;
  recommendationType: 'appliance' | 'behavior' | 'tariff' | 'maintenance';
  calculationAssumptions?: string;
  estimatedEnergySavings?: number;
  estimatedCostSavings?: number;
  confidence?: 'high' | 'medium' | 'estimated';
  status?: 'active' | 'implemented' | 'dismissed';
}

export interface SavingsGoal {
  _id: string;
  name: string;
  baselineConsumption: number;
  targetConsumption: number;
  targetPeriod: string;
  deadline: string;
  status: 'in_progress' | 'achieved' | 'missed';
  currentRecordedKwh?: number;
  progressPercent?: number;
}

export interface Forecast {
  forecastPeriod: string;
  predictedConsumption: number;
  predictedBill: number;
  assumptions: string[];
  uncertaintyInformation?: string;
  isConfident: boolean;
  message?: string;
  dailyAverageKwh: number;
  varianceRangeKwh: { min: number; max: number };
  varianceRangeBill: { min: number; max: number };
}

export interface OcrCandidate {
  value: number;
  confidence: number;
  label: string;
}

export interface OcrResponse {
  extractedReading: number | null;
  unit: string;
  confidence: number;
  status: 'success' | 'uncertain' | 'failed';
  candidates: OcrCandidate[];
  rawText: string;
  message: string;
}
