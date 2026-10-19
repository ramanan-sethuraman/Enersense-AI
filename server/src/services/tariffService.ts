import { ITariff, ITariffSlab } from '../models/types.js';
import { TariffRepository } from '../models/repository.js';

export interface BillCalculationResult {
  unitsConsumed: number;
  energyCharges: number;
  fixedCharges: number;
  otherCharges: number;
  adjustments: number; // discounts/subsidies (negative or offset)
  estimatedTotal: number;
  calculationBreakdown: Array<{
    slab: string;
    units: number;
    rate: number;
    amount: number;
  }>;
  disclaimer: string;
}

export const DEFAULT_SAMPLE_TARIFFS: ITariff[] = [
  {
    state: 'Tamil Nadu',
    distributionCompany: 'TANGEDCO',
    consumerCategory: 'Domestic Low Tension',
    tariffName: 'TANGEDCO Domestic Tariff (200 Units Free ≤500 Units)',
    calculationMethod: 'conditional_tiers',
    tariffSlabs: [
      { minUnits: 1, maxUnits: 200, ratePerUnit: 0.0 }, // 1 to 200: ₹0.00
      { minUnits: 201, maxUnits: 400, ratePerUnit: 4.7 }, // 201 to 400: ₹4.70
      { minUnits: 401, maxUnits: 500, ratePerUnit: 6.3 }, // 401 to 500: ₹6.30
    ],
    conditionalTiers: [
      {
        condition: 'upto_500',
        thresholdUnits: 500,
        title: 'Consumption Upto 500 Unit (200 Units Free)',
        slabs: [
          { minUnits: 1, maxUnits: 200, ratePerUnit: 0.0 },
          { minUnits: 201, maxUnits: 400, ratePerUnit: 4.7 },
          { minUnits: 401, maxUnits: 500, ratePerUnit: 6.3 },
        ],
      },
      {
        condition: 'above_500',
        thresholdUnits: 500,
        title: 'Consumption Above 500 Unit (100 Units Free)',
        slabs: [
          { minUnits: 1, maxUnits: 100, ratePerUnit: 0.0 },
          { minUnits: 101, maxUnits: 400, ratePerUnit: 4.7 },
          { minUnits: 401, maxUnits: 500, ratePerUnit: 6.3 },
          { minUnits: 501, maxUnits: 600, ratePerUnit: 8.4 },
          { minUnits: 601, maxUnits: 800, ratePerUnit: 9.45 },
          { minUnits: 801, maxUnits: 1000, ratePerUnit: 10.5 },
          { minUnits: 1001, maxUnits: null, ratePerUnit: 11.55 },
        ],
      },
    ],
    fixedCharges: 0,
    otherCharges: 0,
    subsidies: [],
    sourceDescription: 'Official Tamil Nadu Electricity Bill New Tariff with 200 units free for consumption up to 500 units, 100 units free above 500 units.',
  },
  {
    state: 'Kerala',
    distributionCompany: 'KSEB',
    consumerCategory: 'LT-1A Domestic (Single Phase)',
    tariffName: 'KSEB Domestic Telescopic Slab',
    calculationMethod: 'progressive_slab',
    tariffSlabs: [
      { minUnits: 0, maxUnits: 50, ratePerUnit: 3.15 },
      { minUnits: 51, maxUnits: 100, ratePerUnit: 3.95 },
      { minUnits: 101, maxUnits: 150, ratePerUnit: 5.0 },
      { minUnits: 151, maxUnits: 200, ratePerUnit: 6.8 },
      { minUnits: 201, maxUnits: 250, ratePerUnit: 8.0 },
      { minUnits: 251, maxUnits: null, ratePerUnit: 8.8 },
    ],
    fixedCharges: 40,
    otherCharges: 10, // 10% electricity duty
    subsidies: [],
    sourceDescription: 'KSERC Multi-Year Tariff Schedule for LT-1A Domestic consumers.',
  },
  {
    state: 'Karnataka',
    distributionCompany: 'BESCOM',
    consumerCategory: 'LT-2(a) Domestic',
    tariffName: 'BESCOM Gruha Jyothi Aligned',
    calculationMethod: 'progressive_slab',
    tariffSlabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 4.75 },
      { minUnits: 101, maxUnits: null, ratePerUnit: 7.0 },
    ],
    fixedCharges: 110,
    otherCharges: 9, // 9% electricity tax
    subsidies: [],
    sourceDescription: 'KERC approved BESCOM LT-2(a) rate model.',
  },
  {
    state: 'Andhra Pradesh',
    distributionCompany: 'APCPDCL',
    consumerCategory: 'LT-I Domestic Category',
    tariffName: 'APCPDCL / APSPDCL Domestic Progressive',
    calculationMethod: 'progressive_slab',
    tariffSlabs: [
      { minUnits: 0, maxUnits: 75, ratePerUnit: 1.9 },
      { minUnits: 76, maxUnits: 125, ratePerUnit: 3.0 },
      { minUnits: 126, maxUnits: 200, ratePerUnit: 4.5 },
      { minUnits: 201, maxUnits: 400, ratePerUnit: 7.0 },
      { minUnits: 401, maxUnits: null, ratePerUnit: 9.75 },
    ],
    fixedCharges: 50,
    otherCharges: 6, // 6% electricity duty
    subsidies: [],
    sourceDescription: 'APERC Retail Supply Tariff for Domestic consumers.',
  },
  {
    state: 'Telangana',
    distributionCompany: 'TGSPDCL (TSSPDCL)',
    consumerCategory: 'LT-I Domestic Category',
    tariffName: 'TGSPDCL Domestic Slab Schedule',
    calculationMethod: 'progressive_slab',
    tariffSlabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 1.95 },
      { minUnits: 101, maxUnits: 200, ratePerUnit: 3.4 },
      { minUnits: 201, maxUnits: 300, ratePerUnit: 7.2 },
      { minUnits: 301, maxUnits: 400, ratePerUnit: 8.5 },
      { minUnits: 401, maxUnits: null, ratePerUnit: 9.5 },
    ],
    fixedCharges: 50,
    otherCharges: 6, // 6% electricity duty
    subsidies: [],
    sourceDescription: 'TSERC approved LT-I Domestic retail tariff order.',
  },
  {
    state: 'Maharashtra',
    distributionCompany: 'MSEDCL',
    consumerCategory: 'LT-I Residential',
    tariffName: 'MSEDCL Domestic 2024-25',
    calculationMethod: 'progressive_slab',
    tariffSlabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 3.36 },
      { minUnits: 101, maxUnits: 300, ratePerUnit: 7.34 },
      { minUnits: 301, maxUnits: 500, ratePerUnit: 10.37 },
      { minUnits: 501, maxUnits: null, ratePerUnit: 11.86 },
    ],
    fixedCharges: 128,
    otherCharges: 16, // 16% electricity duty
    subsidies: [],
    sourceDescription: 'Illustrative rate structure based on MSEDCL Residential Multi-Year Tariff Schedule.',
  },
  {
    state: 'Delhi',
    distributionCompany: 'BSES Rajdhani',
    consumerCategory: 'Domestic (Single Phase)',
    tariffName: 'BSES Domestic Progressive with Subsidy',
    calculationMethod: 'progressive_slab',
    tariffSlabs: [
      { minUnits: 0, maxUnits: 200, ratePerUnit: 3.0 },
      { minUnits: 201, maxUnits: 400, ratePerUnit: 4.5 },
      { minUnits: 401, maxUnits: 800, ratePerUnit: 6.5 },
      { minUnits: 801, maxUnits: null, ratePerUnit: 7.5 },
    ],
    fixedCharges: 40,
    otherCharges: 8, // 8% surcharge
    subsidies: [
      {
        name: 'Delhi Special Domestic Subsidy (<=200 kWh Free)',
        maxEligibleUnits: 200,
        discountPercent: 100,
      },
    ],
    sourceDescription: 'Illustrative rate structure reflecting Delhi DERC progressive domestic slabs.',
  },
  {
    state: 'Uttar Pradesh',
    distributionCompany: 'UPPCL',
    consumerCategory: 'LMV-1 Domestic Light & Fan',
    tariffName: 'UPPCL Urban Domestic Slab',
    calculationMethod: 'progressive_slab',
    tariffSlabs: [
      { minUnits: 0, maxUnits: 100, ratePerUnit: 3.35 },
      { minUnits: 101, maxUnits: 150, ratePerUnit: 3.85 },
      { minUnits: 151, maxUnits: 300, ratePerUnit: 5.5 },
      { minUnits: 301, maxUnits: 500, ratePerUnit: 6.0 },
      { minUnits: 501, maxUnits: null, ratePerUnit: 6.5 },
    ],
    fixedCharges: 110,
    otherCharges: 5,
    subsidies: [],
    sourceDescription: 'Illustrative UPPCL LMV-1 domestic schedule.',
  },
];

export class TariffService {
  public static async initializeDefaultTariffs(): Promise<void> {
    const existing = await TariffRepository.getAll();
    const tn = existing.find((t) => t.state === 'Tamil Nadu');
    const needsRefresh =
      existing.length < DEFAULT_SAMPLE_TARIFFS.length ||
      !tn ||
      tn.tariffName !== DEFAULT_SAMPLE_TARIFFS[0].tariffName ||
      tn.tariffSlabs?.[0]?.maxUnits !== 200;

    if (needsRefresh) {
      console.log('[TariffService] Syncing default tariffs with Tamil Nadu 200 units free dataset...');
      for (const old of existing) {
        if (old._id) {
          await TariffRepository.deleteById(old._id);
        }
      }
      for (const t of DEFAULT_SAMPLE_TARIFFS) {
        await TariffRepository.create(t);
      }
      console.log('[TariffService] Tariffs synced successfully.');
    }
  }

  public static async getTariffForUser(state?: string, discom?: string): Promise<ITariff> {
    if (state) {
      const match = await TariffRepository.findByStateAndDiscom(state, discom);
      if (match) return match;
    }
    const all = await TariffRepository.getAll();
    if (all.length > 0) return all[0];
    return DEFAULT_SAMPLE_TARIFFS[0];
  }

  public static calculateBill(unitsConsumed: number, tariff: ITariff): BillCalculationResult {
    const units = Math.max(0, Math.round(unitsConsumed * 100) / 100);
    const breakdown: Array<{ slab: string; units: number; rate: number; amount: number }> = [];
    let energyCharges = 0;

    // Determine active slabs (supporting conditional tiers such as Tamil Nadu <=500 vs >500)
    let activeSlabs = tariff.tariffSlabs;
    if (tariff.conditionalTiers && tariff.conditionalTiers.length > 0) {
      if (units <= 500) {
        const upto = tariff.conditionalTiers.find((t) => t.condition === 'upto_500') || tariff.conditionalTiers[0];
        if (upto) activeSlabs = upto.slabs;
      } else {
        const above = tariff.conditionalTiers.find((t) => t.condition === 'above_500') || tariff.conditionalTiers[tariff.conditionalTiers.length - 1];
        if (above) activeSlabs = above.slabs;
      }
    } else if (tariff.state === 'Tamil Nadu' || tariff.distributionCompany === 'TANGEDCO') {
      if (units <= 500) {
        activeSlabs = [
          { minUnits: 1, maxUnits: 200, ratePerUnit: 0.0 },
          { minUnits: 201, maxUnits: 400, ratePerUnit: 4.7 },
          { minUnits: 401, maxUnits: 500, ratePerUnit: 6.3 },
        ];
      } else {
        activeSlabs = [
          { minUnits: 1, maxUnits: 100, ratePerUnit: 0.0 },
          { minUnits: 101, maxUnits: 400, ratePerUnit: 4.7 },
          { minUnits: 401, maxUnits: 500, ratePerUnit: 6.3 },
          { minUnits: 501, maxUnits: 600, ratePerUnit: 8.4 },
          { minUnits: 601, maxUnits: 800, ratePerUnit: 9.45 },
          { minUnits: 801, maxUnits: 1000, ratePerUnit: 10.5 },
          { minUnits: 1001, maxUnits: null, ratePerUnit: 11.55 },
        ];
      }
    }

    if (tariff.calculationMethod === 'flat_rate' || !activeSlabs || activeSlabs.length === 0) {
      const rate = activeSlabs?.[0]?.ratePerUnit || 6.5;
      const amount = units * rate;
      energyCharges = amount;
      breakdown.push({
        slab: `All Units (Flat Rate)`,
        units,
        rate,
        amount: Math.round(amount * 100) / 100,
      });
    } else {
      // Progressive slab calculation
      let remainingUnits = units;

      for (let i = 0; i < activeSlabs.length; i++) {
        const slab = activeSlabs[i];
        if (remainingUnits <= 0) break;

        const slabMin = slab.minUnits <= 1 ? 0 : slab.minUnits - 1;
        const slabCapacity = slab.maxUnits !== null ? slab.maxUnits - slabMin : Infinity;

        const unitsInThisSlab = Math.min(remainingUnits, slabCapacity);
        if (unitsInThisSlab > 0) {
          const slabAmount = unitsInThisSlab * slab.ratePerUnit;
          energyCharges += slabAmount;

          const label =
            slab.maxUnits !== null
              ? `${slab.minUnits} - ${slab.maxUnits} kWh`
              : `> ${slab.minUnits - 1} kWh`;

          breakdown.push({
            slab: label,
            units: Math.round(unitsInThisSlab * 100) / 100,
            rate: slab.ratePerUnit,
            amount: Math.round(slabAmount * 100) / 100,
          });

          remainingUnits -= unitsInThisSlab;
        }
      }
    }

    const fixedCharges = tariff.fixedCharges || 0;
    // otherCharges represents percentage surcharge/tax or nominal fee
    const dutyPercent = tariff.otherCharges || 0;
    const otherCharges = Math.round(((energyCharges + fixedCharges) * dutyPercent) / 100 * 100) / 100;

    // Check subsidies
    let adjustments = 0;
    if (tariff.subsidies && tariff.subsidies.length > 0) {
      for (const sub of tariff.subsidies) {
        if (sub.maxEligibleUnits && units <= sub.maxEligibleUnits) {
          if (sub.discountPercent) {
            const discount = (energyCharges * sub.discountPercent) / 100;
            adjustments += discount;
          } else if (sub.discountAmount) {
            adjustments += sub.discountAmount;
          }
        }
      }
    }

    const gross = energyCharges + fixedCharges + otherCharges;
    const estimatedTotal = Math.max(0, Math.round((gross - adjustments) * 100) / 100);

    return {
      unitsConsumed: units,
      energyCharges: Math.round(energyCharges * 100) / 100,
      fixedCharges: Math.round(fixedCharges * 100) / 100,
      otherCharges,
      adjustments: Math.round(adjustments * 100) / 100,
      estimatedTotal,
      calculationBreakdown: breakdown,
      disclaimer:
        'This is an estimated electricity bill. Your final bill may differ depending on applicable tariff rules, taxes, subsidies, fixed charges, meter adjustments, and other utility-specific factors.',
    };
  }
}
