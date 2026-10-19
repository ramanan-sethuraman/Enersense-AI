import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Calculator,
  Info,
  CheckCircle2,
  ChevronDown,
  Layers,
  ArrowRight,
  ShieldAlert,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../services/authContext.js';
import { api } from '../services/api.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { Tariff, BillEstimate, BillRecord } from '../types/index.js';

export const BillsPage: React.FC = () => {
  const { user } = useAuth();
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [selectedTariffId, setSelectedTariffId] = useState<string>('');
  const [inputMode, setInputMode] = useState<'units' | 'readings'>('units');
  const [unitsInput, setUnitsInput] = useState<string>('245');
  const [prevReading, setPrevReading] = useState<string>('');
  const [currReading, setCurrReading] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<BillEstimate | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [pastBills, setPastBills] = useState<BillRecord[]>([]);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const [tariffsRes, summaryRes] = await Promise.all([
          api.getTariffs(),
          api.getDashboardSummary(),
        ]);
        if (tariffsRes.success && tariffsRes.tariffs.length > 0) {
          setTariffs(tariffsRes.tariffs);
          // Match user's state tariff or pick first
          const match = tariffsRes.tariffs.find(
            (t: Tariff) => t.state === user?.locationPreferences?.state
          );
          setSelectedTariffId(match?._id || tariffsRes.tariffs[0]._id);
        }
        if (summaryRes.success && summaryRes.recentBills) {
          setPastBills(summaryRes.recentBills);
        }
      } catch (err) {
        console.error('Error loading tariffs:', err);
      }
    };
    loadInitial();
  }, [user]);

  const activeTariff = tariffs.find((t) => t._id === selectedTariffId) || tariffs[0];

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsCalculating(true);

    try {
      const payload: any = {
        tariffId: selectedTariffId,
      };

      if (inputMode === 'units') {
        const u = parseFloat(unitsInput);
        if (isNaN(u) || u < 0) {
          setErrorMsg('Please enter valid positive units.');
          setIsCalculating(false);
          return;
        }
        payload.unitsConsumed = u;
      } else {
        const p = parseFloat(prevReading);
        const c = parseFloat(currReading);
        if (isNaN(p) || isNaN(c) || p < 0 || c < 0) {
          setErrorMsg('Please enter valid meter readings.');
          setIsCalculating(false);
          return;
        }
        if (c < p) {
          setErrorMsg('Current reading cannot be lower than previous reading without rollover check.');
          setIsCalculating(false);
          return;
        }
        payload.previousReading = p;
        payload.currentReading = c;
      }

      const res = await api.estimateBill(payload);
      if (res.success && res.estimate) {
        setCalculationResult(res.estimate);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Calculation failed');
    } finally {
      setIsCalculating(false);
    }
  };

  // Run initial calculation when tariff loads
  useEffect(() => {
    if (activeTariff && !calculationResult) {
      const fakeEvt = { preventDefault: () => {} } as React.FormEvent;
      handleCalculate(fakeEvt);
    }
  }, [activeTariff]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tariff-Aware Electricity Bill Calculator
          </h1>
          <Badge variant="info">Multi-Slab Engine</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Calculate domestic power charges applying verified progressive slabs, fixed capacity charges, and regional subsidies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* CALCULATOR FORM (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Bill Calculation Parameters</span>
            </h3>

            <form onSubmit={handleCalculate} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Tariff Plan Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Applicable Utility Tariff Schedule
                </label>
                <select
                  value={selectedTariffId}
                  onChange={(e) => setSelectedTariffId(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                >
                  {tariffs.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.state} — {t.distributionCompany} ({t.tariffName})
                    </option>
                  ))}
                </select>
                {activeTariff?.sourceDescription && (
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    {activeTariff.sourceDescription}
                  </p>
                )}
              </div>

              {/* Mode Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Calculation Method
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setInputMode('units')}
                    className={`py-1.5 rounded-lg transition ${
                      inputMode === 'units'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Units Consumed (kWh)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('readings')}
                    className={`py-1.5 rounded-lg transition ${
                      inputMode === 'readings'
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Meter Readings
                  </button>
                </div>
              </div>

              {inputMode === 'units' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Units Consumed in Billing Cycle (kWh)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={unitsInput}
                    onChange={(e) => setUnitsInput(e.target.value)}
                    placeholder="e.g. 245"
                    className="w-full px-3 py-2 text-base font-mono font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Previous Reading
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={prevReading}
                      onChange={(e) => setPrevReading(e.target.value)}
                      placeholder="e.g. 13515"
                      className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Current Reading
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      value={currReading}
                      onChange={(e) => setCurrReading(e.target.value)}
                      placeholder="e.g. 13760"
                      className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isCalculating}
                icon={<Calculator className="w-4 h-4" />}
              >
                Compute Estimated Bill
              </Button>
            </form>
          </div>

          {/* Active Tariff Slabs Reference */}
          {activeTariff && (
            <div className="p-4 bg-slate-50 dark:bg-black rounded-2xl border border-emerald-500/30 dark:border-emerald-500/40 text-xs space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-neutral-800">
                <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  {activeTariff.tariffName}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300/40">
                  Official New Tariff
                </span>
              </div>

              {activeTariff.conditionalTiers && activeTariff.conditionalTiers.length > 0 ? (
                <div className="space-y-3">
                  {activeTariff.conditionalTiers.map((tier, tIdx) => {
                    const isApplicable =
                      tier.condition === 'upto_500'
                        ? !unitsInput || parseFloat(unitsInput) <= 500
                        : parseFloat(unitsInput) > 500;
                    return (
                      <div
                        key={tIdx}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isApplicable
                            ? 'bg-white dark:bg-neutral-950 border-emerald-500/60 shadow-sm'
                            : 'bg-slate-50/50 dark:bg-neutral-900/30 border-slate-200/50 dark:border-neutral-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                          <span>{tier.title}</span>
                          {isApplicable && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded font-semibold">
                              Active Tier
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {tier.slabs.map((s, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>
                                {s.minUnits} - {s.maxUnits !== null ? `${s.maxUnits} kWh` : 'Above'}:
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {s.ratePerUnit === 0 ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE (₹0.00)</span>
                                ) : (
                                  `₹${s.ratePerUnit.toFixed(2)} / kWh`
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {activeTariff.tariffSlabs.map((s, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {s.minUnits} - {s.maxUnits !== null ? `${s.maxUnits} kWh` : 'above'}:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {s.ratePerUnit === 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE (₹0.00)</span>
                        ) : (
                          `₹${s.ratePerUnit.toFixed(2)} / kWh`
                        )}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-slate-500">
                    <span>Fixed Monthly Charge:</span>
                    <span>₹{activeTariff.fixedCharges}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CALCULATION RESULTS & BREAKDOWN (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {calculationResult ? (
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Estimated Electricity Bill
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                    ₹{calculationResult.estimatedTotal.toLocaleString()}
                  </div>
                </div>

                <Badge variant="success" size="md">
                  {calculationResult.unitsConsumed} kWh Total Units
                </Badge>
              </div>

              {/* Summary Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Energy Charges</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    ₹{calculationResult.energyCharges}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Fixed Charges</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    ₹{calculationResult.fixedCharges}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Taxes &amp; Surcharge</span>
                  <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    ₹{calculationResult.otherCharges}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400">Subsidies Applied</span>
                  <p className="text-base font-bold text-emerald-600 mt-1">
                    -₹{calculationResult.adjustments}
                  </p>
                </div>
              </div>

              {/* Progressive Slab-by-Slab Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Detailed Slab-by-Slab Breakdown
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3">Tariff Slab Tier</th>
                        <th className="p-3">Units In Tier</th>
                        <th className="p-3">Rate / Unit</th>
                        <th className="p-3 text-right">Energy Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                      {calculationResult.calculationBreakdown?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-3 font-sans font-semibold text-slate-800 dark:text-slate-200">
                            {item.slab}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            {item.units} kWh
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            ₹{item.rate.toFixed(2)}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                            ₹{item.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Disclaimer Display (Section 9 Requirement) */}
              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">{calculationResult.disclaimer}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 text-xs">
              Configure parameters on the left and click "Compute Estimated Bill" to view the slab breakdown.
            </div>
          )}

          {/* Past Billing Records */}
          {pastBills.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Recent Reconciled Billing Cycles</span>
              </h4>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {pastBills.map((b) => (
                  <div key={b._id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {new Date(b.billingPeriodStart).toLocaleDateString()} – {new Date(b.billingPeriodEnd).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {b.unitsConsumed} kWh • {b.tariffConfiguration?.tariffName}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      ₹{b.estimatedTotal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
