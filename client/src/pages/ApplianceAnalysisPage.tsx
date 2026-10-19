import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Zap,
  Clock,
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useAuth } from '../services/authContext.js';
import { api } from '../services/api.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { Appliance } from '../types/index.js';

const PRESET_APPLIANCES = [
  { name: '1.5 Ton Inverter AC', category: 'Air Conditioning', ratedPowerWatts: 1450, dailyOperatingHours: 6, operatingDaysPerMonth: 30, standbyPowerWatts: 4 },
  { name: 'Double Door Refrigerator (260L)', category: 'Refrigeration', ratedPowerWatts: 180, dailyOperatingHours: 24, operatingDaysPerMonth: 30, standbyPowerWatts: 3 },
  { name: 'Ceiling Fan (Induction)', category: 'Fans & Ventilation', ratedPowerWatts: 75, dailyOperatingHours: 12, operatingDaysPerMonth: 30, standbyPowerWatts: 0 },
  { name: 'Ceiling Fan (BLDC 5-Star)', category: 'Fans & Ventilation', ratedPowerWatts: 28, dailyOperatingHours: 12, operatingDaysPerMonth: 30, standbyPowerWatts: 1 },
  { name: 'Storage Water Geyser (15L)', category: 'Water Heating', ratedPowerWatts: 2000, dailyOperatingHours: 1, operatingDaysPerMonth: 30, standbyPowerWatts: 0 },
  { name: '55" 4K Smart LED TV', category: 'Entertainment', ratedPowerWatts: 110, dailyOperatingHours: 4, operatingDaysPerMonth: 30, standbyPowerWatts: 8 },
  { name: 'Submersible Water Pump (1 HP)', category: 'Pumps & Motors', ratedPowerWatts: 750, dailyOperatingHours: 1, operatingDaysPerMonth: 30, standbyPowerWatts: 0 },
  { name: 'LED Lights Set (8 bulbs)', category: 'Lighting', ratedPowerWatts: 96, dailyOperatingHours: 5, operatingDaysPerMonth: 30, standbyPowerWatts: 0 },
  { name: 'Microwave Convection Oven', category: 'Kitchen', ratedPowerWatts: 1200, dailyOperatingHours: 0.5, operatingDaysPerMonth: 25, standbyPowerWatts: 4 },
];

export const ApplianceAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [discrepancy, setDiscrepancy] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Air Conditioning',
    ratedPowerWatts: 1000,
    quantity: 1,
    dailyOperatingHours: 4,
    operatingDaysPerMonth: 30,
    standbyPowerWatts: 0,
    usageSchedule: '',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAppliances();
      if (res.success) {
        setAppliances(res.appliances || []);
        setSummary(res.summary || null);
      }
      const breakdownRes = await api.getDashboardAppliances();
      if (breakdownRes.success && breakdownRes.discrepancyAnalysis) {
        setDiscrepancy(breakdownRes.discrepancyAnalysis);
      }
    } catch (err) {
      console.error('Error fetching appliances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = (preset?: any) => {
    setEditingId(null);
    setFormError('');
    if (preset) {
      setFormData({
        name: preset.name,
        category: preset.category,
        ratedPowerWatts: preset.ratedPowerWatts,
        quantity: 1,
        dailyOperatingHours: preset.dailyOperatingHours,
        operatingDaysPerMonth: preset.operatingDaysPerMonth,
        standbyPowerWatts: preset.standbyPowerWatts || 0,
        usageSchedule: '',
      });
    } else {
      setFormData({
        name: '',
        category: 'Air Conditioning',
        ratedPowerWatts: 1200,
        quantity: 1,
        dailyOperatingHours: 4,
        operatingDaysPerMonth: 30,
        standbyPowerWatts: 0,
        usageSchedule: '',
      });
    }
    setIsModalOpen(true);
  };

  const openEditModal = (app: Appliance) => {
    setEditingId(app._id);
    setFormError('');
    setFormData({
      name: app.name,
      category: app.category,
      ratedPowerWatts: app.ratedPowerWatts,
      quantity: app.quantity || 1,
      dailyOperatingHours: app.dailyOperatingHours,
      operatingDaysPerMonth: app.operatingDaysPerMonth || 30,
      standbyPowerWatts: app.standbyPowerWatts || 0,
      usageSchedule: app.usageSchedule || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this appliance?')) {
      try {
        await api.deleteAppliance(id);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (formData.ratedPowerWatts <= 0) {
        setFormError('Power in Watts must be greater than zero.');
        setIsSubmitting(false);
        return;
      }
      if (formData.dailyOperatingHours < 0 || formData.dailyOperatingHours > 24) {
        setFormError('Daily operating hours must be between 0 and 24 hours.');
        setIsSubmitting(false);
        return;
      }
      if (formData.operatingDaysPerMonth < 1 || formData.operatingDaysPerMonth > 31) {
        setFormError('Operating days must be between 1 and 31 days per month.');
        setIsSubmitting(false);
        return;
      }

      if (editingId) {
        await api.updateAppliance(editingId, formData);
      } else {
        await api.createAppliance(formData);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAppliances = appliances.filter((a) => {
    if (categoryFilter === 'All') return true;
    return a.category === categoryFilter;
  });

  const categories = ['All', ...Array.from(new Set(appliances.map((a) => a.category)))];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Appliance Consumption &amp; Analysis
            </h1>
            <Badge variant="info">Equipment Profiling</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track appliance power ratings, estimate daily and monthly consumption, and rank your highest electricity consumers.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => openAddModal()} icon={<Plus className="w-4 h-4" />}>
          Add Custom Appliance
        </Button>
      </div>

      {/* Quick Presets Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          Quick Add Common Household Equipment Presets:
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {PRESET_APPLIANCES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => openAddModal(preset)}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition"
            >
              + {preset.name} ({preset.ratedPowerWatts}W)
            </button>
          ))}
        </div>
      </div>

      {/* METRICS & DISCREPANCY AUDIT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Monthly Appliance Energy</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {summary?.totalMonthlyKwh || 0} kWh
          </p>
          <span className="text-xs text-slate-500">Sum of rated running hours</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Monthly Equipment Cost</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
            ₹{summary?.totalMonthlyCost?.toLocaleString() || 0}
          </p>
          <span className="text-xs text-slate-500">Distributed across tariff slabs</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logged Appliances Count</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {appliances.length} Devices
          </p>
          <span className="text-xs text-slate-500">Across {categories.length - 1} categories</span>
        </div>
      </div>

      {/* Discrepancy Analysis (Section 11) */}
      {discrepancy && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-900 dark:text-amber-200">
              Meter vs. Appliance Consumption Audit:
            </span>
            <p className="leading-relaxed text-xs">{discrepancy.explanation}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              * Note: Enersense AI clearly differentiates between software estimates and physical hardware measurement. Unexplained consumption is not attributed to any specific appliance without sub-metering sensors.
            </p>
          </div>
        </div>
      )}

      {/* HIGHEST ENERGY CONSUMERS DYNAMIC RANKING BAR CHART */}
      {appliances.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                "Your Highest Estimated Energy Consumers"
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dynamic ranking calculated from rated Watts × hours × days
              </p>
            </div>
            <Badge variant="neutral" size="sm">
              Ranked Top to Bottom
            </Badge>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={appliances.slice(0, 6)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis type="number" unit=" kWh" tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} stroke="#94A3B8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  formatter={(val: any) => [`${val} kWh`, 'Monthly Estimate']}
                />
                <Bar dataKey="monthlyKwh" fill="#22C55E" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* APPLIANCES TABLE WITH FILTER */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Configured Appliances Detail
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Edit usage assumptions anytime to recalibrate estimated consumption
            </p>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Filter:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Appliance Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Rating (W)</th>
                <th className="p-3">Daily Runtime</th>
                <th className="p-3">Daily kWh</th>
                <th className="p-3">Monthly kWh</th>
                <th className="p-3">Share (%)</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredAppliances.map((app) => (
                <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">
                    {app.name}
                    {app.quantity > 1 && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 rounded font-normal text-slate-500">
                        x{app.quantity}
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                    {app.category}
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{app.ratedPowerWatts} W</td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">
                    {app.dailyOperatingHours} hrs/d ({app.operatingDaysPerMonth} d/mo)
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{app.dailyKwh} kWh</td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    {app.monthlyKwh} kWh
                  </td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">
                    {app.percentageOfTotal}%
                  </td>
                  <td className="p-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(app)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(app._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Appliance Profile' : 'Add New Household Appliance'}
        description="Specify equipment rated wattage and operating duration"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Appliance Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Master Bedroom Inverter AC"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Air Conditioning">Air Conditioning</option>
                <option value="Refrigeration">Refrigeration</option>
                <option value="Fans & Ventilation">Fans & Ventilation</option>
                <option value="Water Heating">Water Heating</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Pumps & Motors">Pumps & Motors</option>
                <option value="Lighting">Lighting</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Rated Power (Watts) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.ratedPowerWatts}
                onChange={(e) =>
                  setFormData({ ...formData, ratedPowerWatts: parseFloat(e.target.value) || 0 })
                }
                placeholder="e.g. 1500"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Standby Power (Watts)
              </label>
              <input
                type="number"
                min="0"
                value={formData.standbyPowerWatts}
                onChange={(e) =>
                  setFormData({ ...formData, standbyPowerWatts: parseFloat(e.target.value) || 0 })
                }
                placeholder="e.g. 5"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Daily Hours (0 to 24) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="24"
                required
                value={formData.dailyOperatingHours}
                onChange={(e) =>
                  setFormData({ ...formData, dailyOperatingHours: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Days / Month (1 to 31) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={formData.operatingDaysPerMonth}
                onChange={(e) =>
                  setFormData({ ...formData, operatingDaysPerMonth: parseInt(e.target.value) || 30 })
                }
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              {editingId ? 'Update Appliance' : 'Save Appliance'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
