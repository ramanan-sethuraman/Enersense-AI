import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lightbulb,
  ShieldCheck,
  TrendingDown,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../services/authContext.js';
import { api } from '../services/api.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { Recommendation } from '../types/index.js';

export const AiAdvisorPage: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.getRecommendations();
      if (res.success) {
        setRecommendations(res.recommendations || []);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const res = await api.generateRecommendations();
      if (res.success) {
        setRecommendations(res.recommendations || []);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate recommendations');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.updateRecommendationStatus(id, status);
      setRecommendations((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: status as any } : r))
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (activeFilter === 'all') return true;
    return r.recommendationType === activeFilter;
  });

  // Calculate potential total savings from active recommendations
  const totalPotentialKwh = recommendations
    .filter((r) => r.status === 'active')
    .reduce((sum, r) => sum + (r.estimatedEnergySavings || 0), 0);

  const totalPotentialCost = recommendations
    .filter((r) => r.status === 'active')
    .reduce((sum, r) => sum + (r.estimatedCostSavings || 0), 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Energy Advisor
            </h1>
            <Badge variant="success">Personalized</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deterministic energy-saving actions formulated strictly from your logged appliances and meter readings.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          loading={isRegenerating}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Regenerate Analysis
        </Button>
      </div>

      {/* Aggregate Savings Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
            Total Achievable Monthly Reductions
          </span>
          <div className="flex items-baseline justify-center sm:justify-start gap-3">
            <span className="text-3xl sm:text-4xl font-black tracking-tight">
              ₹{Math.round(totalPotentialCost).toLocaleString()}
            </span>
            <span className="text-emerald-200 text-sm font-semibold">
              / month ({Math.round(totalPotentialKwh * 10) / 10} kWh)
            </span>
          </div>
          <p className="text-xs text-emerald-100/80">
            Based on implementing your active personalized recommendations below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm" className="bg-white/10 text-white border-white/20">
            Deterministic Rule Engine
          </Badge>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'appliance', 'behavior', 'tariff', 'maintenance'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition ${
              activeFilter === filter
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Recommendations Cards List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredRecs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
          No recommendations found in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecs.map((rec) => {
            const isImplemented = rec.status === 'implemented';
            const isDismissed = rec.status === 'dismissed';

            return (
              <div
                key={rec._id}
                className={`p-5 sm:p-6 rounded-2xl border transition shadow-soft ${
                  isImplemented
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/60'
                    : isDismissed
                    ? 'opacity-60 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-slate-900 dark:text-white">
                        {rec.title}
                      </span>
                      <Badge
                        variant={
                          rec.recommendationType === 'appliance'
                            ? 'info'
                            : rec.recommendationType === 'tariff'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {rec.recommendationType}
                      </Badge>
                      {rec.confidence && (
                        <Badge
                          variant={rec.confidence === 'high' ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {rec.confidence} Confidence
                        </Badge>
                      )}
                      {isImplemented && <Badge variant="success">Implemented ✓</Badge>}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rec.description}
                    </p>

                    {/* Explicit Calculation Assumptions */}
                    {rec.calculationAssumptions && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-mono text-slate-600 dark:text-slate-400">
                        <span className="font-bold font-sans text-slate-700 dark:text-slate-300">
                          Calculation Basis:{' '}
                        </span>
                        {rec.calculationAssumptions}
                      </div>
                    )}
                  </div>

                  {/* Savings Impact Box & Action Buttons */}
                  <div className="sm:text-right shrink-0 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        -₹{rec.estimatedCostSavings || 0}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {rec.estimatedEnergySavings || 0} kWh saved/mo
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isImplemented ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleStatusChange(rec._id, 'implemented')}
                          icon={<CheckCircle className="w-3.5 h-3.5" />}
                        >
                          Mark Done
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(rec._id, 'active')}
                        >
                          Undo
                        </Button>
                      )}

                      {!isDismissed ? (
                        <button
                          onClick={() => handleStatusChange(rec._id, 'dismissed')}
                          title="Dismiss Recommendation"
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(rec._id, 'active')}
                        >
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Methodology Disclaimer */}
      <div className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Transparency &amp; Algorithmic Integrity
        </span>
        <p className="leading-relaxed">
          Enersense AI recommendations strictly reject arbitrary savings percentages. Every potential kWh reduction is derived mathematically from appliance power ratings, duty-cycle operating hours, and prevailing utility tariff slabs.
        </p>
      </div>
    </div>
  );
};
