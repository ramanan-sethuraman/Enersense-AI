import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Receipt,
  TrendingDown,
  TrendingUp,
  Cpu,
  Sparkles,
  ScanLine,
  Plus,
  FileText,
  Calculator,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../services/authContext.js';
import { api } from '../services/api.js';
import { StatCard } from '../components/StatCard.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { EmptyState } from '../components/EmptyState.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [consumptionPoints, setConsumptionPoints] = useState<any[]>([]);
  const [applianceData, setApplianceData] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, consRes, appRes] = await Promise.all([
        api.getDashboardSummary(),
        api.getDashboardConsumption(),
        api.getDashboardAppliances(),
      ]);

      if (sumRes.success) {
        setSummary(sumRes.summary);
        setInsights(sumRes.insights || []);
      }
      if (consRes.success) {
        setConsumptionPoints(consRes.points || []);
      }
      if (appRes.success) {
        setApplianceData(appRes);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#22C55E', '#2563EB', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const hasNoReadings = summary?.totalReadingsCount === 0;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Energy Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time household consumption monitoring and tariff-aware estimates for{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {user?.locationPreferences?.state || 'Tamil Nadu'} ({user?.locationPreferences?.distributionCompany || 'TANGEDCO'})
            </span>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
          <Link to="/app/meter-scanner" className="w-full sm:w-auto">
            <Button variant="primary" size="sm" className="w-full justify-center px-2 sm:px-3 text-xs" icon={<ScanLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}>
              Scan Meter
            </Button>
          </Link>
          <Link to="/app/bills" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full justify-center px-2 sm:px-3 text-xs" icon={<Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}>
              Calculate Bill
            </Button>
          </Link>
          <Link to="/app/appliances" className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full justify-center px-2 sm:px-3 text-xs" icon={<Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}>
              Appliances
            </Button>
          </Link>
        </div>
      </div>

      {/* Empty State for brand new users */}
      {hasNoReadings ? (
        <EmptyState
          icon={<Zap className="w-8 h-8" />}
          title="No Meter Readings Logged Yet"
          description="Photograph your electricity meter counter or log your initial reading to unlock automated consumption calculations, tariff estimates, and AI recommendations."
          actionText="Open Meter Scanner"
          onAction={() => window.location.assign('/app/meter-scanner')}
        />
      ) : (
        <>
          {/* STATISTIC CARDS (Section 7) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Current Billing Consumption"
              value={summary?.currentBillingPeriodConsumption || 0}
              unit="kWh"
              icon={<Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
              change={summary?.consumptionChangePercent}
              changeLabel="vs previous cycle"
              accent="green"
            />

            <StatCard
              title="Estimated Electricity Bill"
              value={`₹${summary?.estimatedCurrentBill?.toLocaleString() || 0}`}
              icon={<Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
              subtitle={`${user?.locationPreferences?.distributionCompany || 'MSEDCL'} Slab Estimate`}
              accent="blue"
            />

            <StatCard
              title="Previous Billing Consumption"
              value={summary?.previousBillingPeriodConsumption || 0}
              unit="kWh"
              icon={<TrendingDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />}
              subtitle="Prior logged cycle"
              accent="slate"
            />

            <StatCard
              title="Consumption Velocity"
              value={`${Math.abs(summary?.consumptionChangePercent || 0)}%`}
              icon={
                summary?.consumptionChangePercent > 0 ? (
                  <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )
              }
              subtitle={
                summary?.consumptionChangePercent > 0 ? 'Increase over baseline' : 'Reduction vs previous cycle'
              }
              accent={summary?.consumptionChangePercent > 0 ? 'amber' : 'green'}
            />
          </div>

          {/* DYNAMIC GROUNDED INSIGHTS CARDS */}
          {insights.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-blue-950/30 border border-emerald-500/20 shadow-soft">
              <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                <span>Grounded Household Energy Insights</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {insights.map((text, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold shrink-0">•</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHARTS ROW 1: Monthly Consumption & Expense Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart A: Monthly Consumption */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    Monthly Electricity Consumption
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Units consumed (kWh) during previous billing periods
                  </p>
                </div>
                <Badge variant="neutral" size="sm">
                  Historical
                </Badge>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                {consumptionPoints.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={consumptionPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" unit=" kWh" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                          border: 'none',
                        }}
                        formatter={(val: any) => [`${val} kWh`, 'Consumed']}
                      />
                      <Bar dataKey="unitsConsumed" fill="#22C55E" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">
                    Log at least 2 readings to view consumption bars
                  </div>
                )}
              </div>
            </div>

            {/* Chart B: Electricity Expense Trends */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
              <div className="flex items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    Electricity Expense Trends
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Calculated billing amounts (₹) applying progressive slabs
                  </p>
                </div>
                <Badge variant="info" size="sm">
                  Tariff Estimated
                </Badge>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                {consumptionPoints.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={consumptionPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="billGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#94A3B8" unit="₹" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                          border: 'none',
                        }}
                        formatter={(val: any) => [`₹${val}`, 'Estimated Bill']}
                      />
                      <Area
                        type="monotone"
                        dataKey="estimatedBill"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#billGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">
                    Expense trends will render as bill cycles accumulate
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CHARTS ROW 2: Appliance Breakdown & Highest Energy Consumers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart C: Category Breakdown */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4 lg:col-span-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Appliance Energy Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share of estimated monthly power consumption
              </p>

              <div className="h-56 w-full flex items-center justify-center">
                {applianceData?.categoryBreakdown && applianceData.categoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applianceData.categoryBreakdown}
                        dataKey="totalKwh"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {applianceData.categoryBreakdown.map((_: any, idx: number) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '12px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                          border: 'none',
                        }}
                        formatter={(val: any) => [`${val} kWh`, 'Estimated']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-slate-400 text-center">
                    No appliances configured yet.
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {applianceData?.categoryBreakdown?.slice(0, 4).map((c: any, idx: number) => (
                  <div key={c.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      ></span>
                      <span className="truncate max-w-[120px] text-slate-700 dark:text-slate-300">
                        {c.category}
                      </span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">
                      {c.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Highest Estimated Energy Consumers Ranking (Section 11) */}
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Your Highest Estimated Energy Consumers
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dynamically ranked by monthly kWh and operational duration
                  </p>
                </div>
                <Link to="/app/appliances">
                  <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Manage All
                  </Button>
                </Link>
              </div>

              <div className="space-y-3 pt-1">
                {applianceData?.appliances?.slice(0, 4).map((app: any, idx: number) => (
                  <div
                    key={app._id}
                    className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 min-w-0"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{app.name}</h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                          {app.ratedPowerWatts}W • {app.dailyOperatingHours} hrs/d • {app.category}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block whitespace-nowrap">
                        {app.monthlyKwh} kWh
                      </span>
                      <p className="text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        ~₹{app.monthlyCost}/mo
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Meter vs Appliance Discrepancy Alert */}
              {applianceData?.discrepancyAnalysis && (
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-800 dark:text-amber-300">
                      Discrepancy Analysis:
                    </span>{' '}
                    {applianceData.discrepancyAnalysis.explanation}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
