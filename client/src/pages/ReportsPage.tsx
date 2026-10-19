import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  Cpu,
  Target,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../services/authContext.js';
import { api } from '../services/api.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { Logo } from '../components/Logo.js';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<'30d' | '90d' | '180d' | 'all'>('180d');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (range: string) => {
    setLoading(true);
    try {
      const now = new Date();
      let start = '';
      if (range === '30d') {
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      } else if (range === '90d') {
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      } else if (range === '180d') {
        start = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      }

      const params = start ? `startDate=${start}` : '';
      const res = await api.getReportSummary(params);
      if (res.success) {
        setReport(res.report);
      }
    } catch (err) {
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(dateRange);
  }, [dateRange]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    window.open(api.getReportCsvUrl(), '_blank');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Title & Export Actions (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Energy Consumption Reports &amp; Exports
            </h1>
            <Badge variant="neutral">Formal Audit</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate formal household energy summaries, export verified meter ledgers, and download CSV receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadCsv} icon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Range Filter Controls (hidden on print) */}
      <div className="no-print p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-slate-700 dark:text-slate-300">Reporting Horizon:</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          {[
            { id: '30d', label: 'Last 30 Days' },
            { id: '90d', label: 'Last 3 Months' },
            { id: '180d', label: 'Last 6 Months' },
            { id: 'all', label: 'All Time' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDateRange(item.id as any)}
              className={`px-3 py-1.5 rounded-xl transition ${
                dateRange === item.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* FORMAL REPORT DOCUMENT (Styled for screen & print) */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
          Compiling energy report data...
        </div>
      ) : report ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft p-6 sm:p-10 space-y-8">
          {/* Official Report Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-slate-900 dark:border-slate-700 gap-4">
            <div className="space-y-2">
              <Logo size="md" showTagline />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white pt-1">
                Household Electricity Consumption Audit Report
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Report Reference ID: EA-REP-{Date.now().toString().slice(-8)}
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">{user?.name}</div>
              <div className="text-slate-500">{user?.email}</div>
              <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                {user?.locationPreferences?.state || 'Tamil Nadu'} • {report.tariffApplied}
              </div>
              <div className="text-slate-400 text-[11px] pt-1">
                Generated: {new Date(report.generatedAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Key Executive Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Energy Consumed
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {report.metrics?.totalUnitsConsumed} kWh
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Estimated Energy Expense
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{report.metrics?.totalEstimatedBill?.toLocaleString()}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Meter Readings Logged
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {report.metrics?.readingsLogged} Intervals
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Equip. Monthly Baseline
              </span>
              <p className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {report.metrics?.estimatedMonthlyApplianceKwh} kWh
              </p>
            </div>
          </div>

          {/* Section 1: Meter Reading History Ledger */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>1. Verified Chronological Meter Reading History</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-sans font-bold">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Reading (kWh)</th>
                    <th className="p-2.5">Units Consumed</th>
                    <th className="p-2.5">Source</th>
                    <th className="p-2.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {report.readings?.map((r: any) => (
                    <tr key={r._id}>
                      <td className="p-2.5 font-sans font-medium text-slate-800 dark:text-slate-200">
                        {new Date(r.readingDate).toLocaleDateString()}
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">
                        {r.readingValue} kWh
                      </td>
                      <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
                        {r.unitsConsumed ? `+${r.unitsConsumed} kWh` : '0 kWh'}
                      </td>
                      <td className="p-2.5 font-sans uppercase text-[10px]">
                        {r.source}
                      </td>
                      <td className="p-2.5 font-sans text-slate-500 truncate max-w-[200px]">
                        {r.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Appliance Category Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>2. Appliance Category Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {report.applianceBreakdown?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                    {item.category}
                  </span>
                  <div className="font-black text-slate-900 dark:text-white mt-1 text-base">
                    {item.totalKwh} kWh
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {item.percentage}% of appliances
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Active Savings Goals & AI Recommendations */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>3. Top AI Energy Efficiency Recommendations</span>
            </h3>

            <div className="space-y-2">
              {report.recommendations?.map((rec: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between gap-4"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">{rec.title}</h5>
                    <p className="text-[11px] text-slate-500 font-mono">{rec.calculationAssumptions}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-emerald-600 font-mono">
                      Save ₹{rec.estimatedCostSavings}/mo
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      -{rec.estimatedEnergySavings} kWh
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formal Audit Disclaimer Footer (Section 16) */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-2 text-[11px] text-slate-500 leading-relaxed">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Methodology &amp; Regulatory Distinction Statement</span>
            </div>
            <p>{report.disclaimer}</p>
            <p className="font-mono text-[10px]">
              Enersense AI • Energy Audit Report • Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
