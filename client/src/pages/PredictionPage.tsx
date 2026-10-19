import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Receipt,
  HelpCircle,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
} from 'recharts';
import { useAuth } from '../services/authContext.js';
import { api } from '../services/api.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { Forecast } from '../types/index.js';
import { EmptyState } from '../components/EmptyState.js';

export const PredictionPage: React.FC = () => {
  const { user } = useAuth();
  const [forecastDays, setForecastDays] = useState<number>(30);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const loadForecast = async (days: number) => {
    setLoading(true);
    try {
      const [foreRes, consRes] = await Promise.all([
        api.getForecast(days),
        api.getDashboardConsumption(),
      ]);

      if (foreRes.success) {
        setForecast(foreRes.forecast);
      }

      if (consRes.success && consRes.points) {
        // Prepare chart combining historical + projected point
        const points = consRes.points.map((p: any) => ({
          name: p.period,
          historicalKwh: p.unitsConsumed,
          projectedKwh: null,
        }));

        if (foreRes.forecast?.isConfident) {
          points.push({
            name: `Projected (${days}d)`,
            historicalKwh: null,
            projectedKwh: foreRes.forecast.predictedConsumption,
          });
        }
        setChartData(points);
      }
    } catch (err) {
      console.error('Error fetching forecast:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast(forecastDays);
  }, [forecastDays]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Electricity Bill Prediction &amp; Forecasting
            </h1>
            <Badge variant="info">Statistical Extrapolation</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Statistically projected electricity consumption and expected utility expenses before your bill arrives.
          </p>
        </div>

        {/* Forecast Horizon Toggle */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <span className="text-slate-400 px-2">Horizon:</span>
          {[15, 30, 45, 60].map((days) => (
            <button
              key={days}
              onClick={() => setForecastDays(days)}
              className={`px-3 py-1 rounded-lg transition ${
                forecastDays === days
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      ) : !forecast?.isConfident ? (
        <EmptyState
          icon={<TrendingUp className="w-8 h-8" />}
          title="More Meter Readings Needed"
          description={
            forecast?.message ||
            'At least two chronological meter readings spanning separate days are required to calculate a consumption rate baseline.'
          }
          actionText="Add Meter Reading"
          onAction={() => window.location.assign('/app/meter-scanner')}
        />
      ) : (
        <>
          {/* 3 PREDICTIVE METRIC CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Predicted Consumption
              </span>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {forecast.predictedConsumption} kWh
              </div>
              <p className="text-xs text-slate-500">
                Range: {forecast.varianceRangeKwh?.min} – {forecast.varianceRangeKwh?.max} kWh
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Predicted Electricity Bill
              </span>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{forecast.predictedBill?.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500">
                Estimated Range: ₹{forecast.varianceRangeBill?.min} – ₹{forecast.varianceRangeBill?.max}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Daily Velocity Baseline
              </span>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                {forecast.dailyAverageKwh} kWh
              </div>
              <p className="text-xs text-slate-500">
                Average consumption per 24-hour cycle
              </p>
            </div>
          </div>

          {/* HISTORICAL VS PROJECTED CHART */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Consumption History vs. Projected Horizon
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Observed historical meter intervals alongside projected next cycle
                </p>
              </div>
              <Badge variant="info" size="sm">
                Forecast Horizon: {forecastDays} Days
              </Badge>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" unit=" kWh" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="historicalKwh"
                    name="Observed Units"
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#22C55E' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedKwh"
                    name="Projected Forecast"
                    stroke="#2563EB"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 6, fill: '#2563EB' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ASSUMPTIONS & UNCERTAINTY DETAILS (Section 13) */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Model Assumptions &amp; Uncertainty Boundaries</span>
            </h3>

            <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {forecast.assumptions?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {forecast.uncertaintyInformation && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-mono text-slate-500 border border-slate-200/60 dark:border-slate-700/60">
                {forecast.uncertaintyInformation}
              </div>
            )}

            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Important Distinction:</strong> This projection represents a mathematical baseline forecast extrapolated from your prior meter logging velocity. It is not an official utility demand notice and does not account for sudden weather extremes or unlogged equipment additions.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
