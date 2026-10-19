import { IAppliance, IReading, ITariff, ISavingsGoal, IRecommendation } from '../models/types.js';
import { config } from '../config/env.js';
import { TariffService } from './tariffService.js';
import { ApplianceService } from './applianceService.js';

export interface RecommendationInput {
  userId: string;
  readings: IReading[];
  appliances: IAppliance[];
  goals: ISavingsGoal[];
  tariff: ITariff;
}

export class AiService {
  public static async generateRecommendations(input: RecommendationInput): Promise<IRecommendation[]> {
    // If AI provider is configured and has an API key, we can call external provider,
    // otherwise (or on failure) we use the comprehensive deterministic rule-based engine.
    if (config.aiApiKey && (config.aiProvider === 'gemini' || config.aiProvider === 'openai')) {
      try {
        const aiRecs = await this.callExternalAi(input);
        if (aiRecs && aiRecs.length > 0) {
          return aiRecs;
        }
      } catch (err: any) {
        console.warn('[AiService] External AI provider failed, falling back to rule-based engine:', err.message);
      }
    }

    return this.generateRuleBasedRecommendations(input);
  }

  public static generateRuleBasedRecommendations(input: RecommendationInput): IRecommendation[] {
    const { userId, appliances, tariff, readings } = input;
    const recommendations: IRecommendation[] = [];

    // Effective tariff rate estimation
    const sampleBill = TariffService.calculateBill(250, tariff);
    const avgRatePerKwh = sampleBill.estimatedTotal > 0 ? sampleBill.estimatedTotal / 250 : 6.5;

    // 1. Analyze Air Conditioners
    const acs = appliances.filter(
      (a) =>
        a.category.toLowerCase().includes('ac') ||
        a.category.toLowerCase().includes('cooling') ||
        a.name.toLowerCase().includes('ac') ||
        a.name.toLowerCase().includes('air conditioner')
    );

    if (acs.length > 0) {
      for (const ac of acs) {
        if (ac.dailyOperatingHours > 3) {
          // Reducing 1 hour per day
          const powerKw = (ac.ratedPowerWatts * ac.quantity) / 1000;
          const monthlyDays = ac.operatingDaysPerMonth || 30;
          const savedKwh = Math.round(powerKw * 1 * monthlyDays * 10) / 10;
          const savedCost = Math.round(savedKwh * avgRatePerKwh);

          recommendations.push({
            userId,
            title: `Optimize ${ac.name} Operating Time`,
            description: `Your ${ac.name} (${ac.ratedPowerWatts}W) currently runs ~${ac.dailyOperatingHours} hrs/day. Reducing cooling run-time by just 1 hour each day (or setting the thermostat to 24°C instead of 18-20°C) reduces compressor duty significantly.`,
            recommendationType: 'appliance',
            calculationAssumptions: `Calculated as: ${powerKw.toFixed(2)} kW × 1 hr/day × ${monthlyDays} days = ${savedKwh} kWh/month at ~₹${avgRatePerKwh.toFixed(2)}/kWh.`,
            estimatedEnergySavings: savedKwh,
            estimatedCostSavings: savedCost,
            confidence: 'high',
            status: 'active',
          });
        }
      }
    }

    // 2. Analyze Refrigerators / Constant running loads
    const fridges = appliances.filter(
      (a) =>
        a.category.toLowerCase().includes('refrigerator') ||
        a.name.toLowerCase().includes('fridge') ||
        a.name.toLowerCase().includes('refrigerator')
    );
    if (fridges.length > 0) {
      const fridge = fridges[0];
      const powerKw = (fridge.ratedPowerWatts * fridge.quantity) / 1000;
      // Improving door seal & coil cleanliness saves ~15% compressor energy
      const estimatedSavingKwh = Math.round(powerKw * 24 * 0.15 * 30 * 10) / 10;
      const estimatedSavingCost = Math.round(estimatedSavingKwh * avgRatePerKwh);

      recommendations.push({
        userId,
        title: `Clean Refrigerator Coils and Maintain Door Seals`,
        description: `Dust accumulation on condenser coils and worn door gaskets force the compressor to cycle more frequently. Ensuring a 3-inch gap behind the unit and wiping gaskets saves continuous baseline power.`,
        recommendationType: 'maintenance',
        calculationAssumptions: `Estimated 15% efficiency recovery on ${fridge.name} rated at ${fridge.ratedPowerWatts}W running 24 hrs.`,
        estimatedEnergySavings: estimatedSavingKwh,
        estimatedCostSavings: estimatedSavingCost,
        confidence: 'medium',
        status: 'active',
      });
    }

    // 3. Analyze Water Heaters / Geysers
    const geysers = appliances.filter(
      (a) =>
        a.category.toLowerCase().includes('water heater') ||
        a.name.toLowerCase().includes('geyser') ||
        a.name.toLowerCase().includes('water heater')
    );
    if (geysers.length > 0) {
      for (const g of geysers) {
        if (g.ratedPowerWatts >= 1500) {
          const powerKw = (g.ratedPowerWatts * g.quantity) / 1000;
          // Switching off 20 mins earlier saves 0.33 hr
          const savedKwh = Math.round(powerKw * 0.33 * 30 * 10) / 10;
          const savedCost = Math.round(savedKwh * avgRatePerKwh);

          recommendations.push({
            userId,
            title: `Turn Off Water Heater (${g.name}) Immediately After Heating`,
            description: `Electric geysers experience substantial standby thermal loss if left energized continuously. Installing an automated plug timer or turning off manually saves thermal reheat cycles.`,
            recommendationType: 'behavior',
            calculationAssumptions: `Avoiding 20 minutes unnecessary reheat: ${powerKw.toFixed(1)} kW × 0.33 hr × 30 days.`,
            estimatedEnergySavings: savedKwh,
            estimatedCostSavings: savedCost,
            confidence: 'high',
            status: 'active',
          });
        }
      }
    }

    // 4. Standby / Vampire Power Audit
    const totalStandbyWatts = appliances.reduce(
      (sum, a) => sum + (a.standbyPowerWatts || 0) * (a.quantity || 1),
      0
    );
    if (totalStandbyWatts > 10) {
      const standbyKw = totalStandbyWatts / 1000;
      const monthlyKwh = Math.round(standbyKw * 24 * 30 * 10) / 10;
      const monthlyCost = Math.round(monthlyKwh * avgRatePerKwh);

      recommendations.push({
        userId,
        title: 'Eliminate Phantom Standby Loads',
        description: `Your appliances consume an estimated ${totalStandbyWatts}W in standby mode (TVs, microwaves, chargers, set-top boxes). Utilizing smart power strips with master-switches eliminates this silent drain.`,
        recommendationType: 'behavior',
        calculationAssumptions: `${totalStandbyWatts}W standby × 24 hrs × 30 days = ${monthlyKwh} kWh/month.`,
        estimatedEnergySavings: monthlyKwh,
        estimatedCostSavings: monthlyCost,
        confidence: 'high',
        status: 'active',
      });
    }

    // 5. Lighting / Ceiling Fans
    const fansAndLights = appliances.filter(
      (a) =>
        a.category.toLowerCase().includes('light') ||
        a.category.toLowerCase().includes('fan') ||
        a.name.toLowerCase().includes('fan')
    );
    if (fansAndLights.length > 0) {
      recommendations.push({
        userId,
        title: 'Upgrade Older Induction Fans to BLDC Technology',
        description: `Standard ceiling fans draw ~75W, whereas Brushless DC (BLDC) fans draw only 28W–32W for equivalent airflow, yielding over 55% direct power savings on long-running appliances.`,
        recommendationType: 'appliance',
        calculationAssumptions: 'Replacing a 75W fan with a 30W BLDC fan for 12 hours/day saves ~16.2 kWh per fan monthly.',
        estimatedEnergySavings: 16.2,
        estimatedCostSavings: Math.round(16.2 * avgRatePerKwh),
        confidence: 'medium',
        status: 'active',
      });
    }

    // 6. Recent meter reading trend analysis
    if (readings.length >= 2) {
      const sorted = [...readings].sort(
        (a, b) => new Date(b.readingDate).getTime() - new Date(a.readingDate).getTime()
      );
      const latest = sorted[0];
      const previous = sorted[1];
      if (latest.readingValue > previous.readingValue) {
        const consumed = latest.readingValue - previous.readingValue;
        if (consumed > 300) {
          recommendations.push({
            userId,
            title: 'High Consumption Alert: Tariff Higher Slab Warning',
            description: `Your recent consumption reached ${consumed} kWh, placing energy charges into higher progressive tariff tiers (above 300 kWh). Shifting 15% of flexible appliance loads could drop your billing back into lower cost slabs.`,
            recommendationType: 'tariff',
            calculationAssumptions: `Calculated from your latest meter interval reading (${consumed} kWh).`,
            estimatedEnergySavings: Math.round(consumed * 0.15 * 10) / 10,
            estimatedCostSavings: Math.round(consumed * 0.15 * avgRatePerKwh * 1.2),
            confidence: 'high',
            status: 'active',
          });
        }
      }
    }

    // Fallback general tip if few appliances logged
    if (recommendations.length === 0) {
      recommendations.push({
        userId,
        title: 'Add More Appliances for Granular AI Energy Analysis',
        description: 'Logging your household appliances (air conditioners, geysers, refrigerators, and pumps) enables Enersense AI to pinpoint specific high-consumption equipment and formulate actionable dollar-savings recommendations.',
        recommendationType: 'behavior',
        calculationAssumptions: 'Personalized formulas activate automatically as appliances are entered.',
        estimatedEnergySavings: 20,
        estimatedCostSavings: Math.round(20 * avgRatePerKwh),
        confidence: 'estimated',
        status: 'active',
      });
    }

    return recommendations;
  }

  private static async callExternalAi(input: RecommendationInput): Promise<IRecommendation[]> {
    // If user configured Gemini or OpenAI, call API
    // We format prompt with exact user appliances, readings, and tariff
    if (config.aiProvider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.aiApiKey}`;
      const prompt = `You are Enersense AI, an expert electricity efficiency advisor for Indian households.
Analyze the following household data:
Appliances: ${JSON.stringify(input.appliances)}
Recent Meter Readings: ${JSON.stringify(input.readings.slice(-4))}
Tariff: ${input.tariff.tariffName} (Fixed: ₹${input.tariff.fixedCharges})

Provide 3 to 5 realistic, high-impact recommendations in valid JSON format:
[
  {
    "title": "string",
    "description": "string",
    "recommendationType": "appliance" | "behavior" | "tariff" | "maintenance",
    "calculationAssumptions": "string showing explicit formula without inventing fake data",
    "estimatedEnergySavings": number (kWh),
    "estimatedCostSavings": number (INR),
    "confidence": "high" | "medium" | "estimated"
  }
]
Return ONLY JSON without markdown formatting.`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API responded with status ${response.status}`);
      }

      const data: any = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          ...item,
          userId: input.userId,
          status: 'active',
        }));
      }
    }
    return [];
  }
}
