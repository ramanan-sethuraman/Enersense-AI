import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Award,
  CheckCircle2,
  Clock,
  Trash2,
  Trophy,
  Flame,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import { useAuth } from '../services/authContext.js';
import { api } from '../services/api.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { SavingsGoal } from '../types/index.js';

export const SavingsGoalsPage: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [baselineConsumption, setBaselineConsumption] = useState<string>('245');
  const [targetConsumption, setTargetConsumption] = useState<string>('220');
  const [targetPeriod, setTargetPeriod] = useState('November 2026');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const res = await api.getGoals();
      if (res.success) {
        setGoals(res.goals || []);
      }
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const base = parseFloat(baselineConsumption);
    const target = parseFloat(targetConsumption);

    if (isNaN(base) || base <= 0) {
      setFormError('Baseline consumption must be greater than zero kWh.');
      return;
    }
    if (isNaN(target) || target < 0 || target >= base) {
      setFormError('Target consumption must be lower than baseline consumption.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createGoal({
        name,
        baselineConsumption: base,
        targetConsumption: target,
        targetPeriod,
        deadline,
      });
      setIsModalOpen(false);
      setName('');
      await loadGoals();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this savings goal?')) {
      try {
        await api.deleteGoal(id);
        await loadGoals();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  // Gamification Badges
  const badges = [
    { title: 'Baseline Established', desc: 'Logged initial meter readings', unlocked: true, icon: CheckCircle2 },
    { title: 'Tariff Explorer', desc: 'Simulated slab-aware bill estimates', unlocked: true, icon: Trophy },
    { title: 'Appliance Auditor', desc: 'Added 5+ household appliances', unlocked: true, icon: Flame },
    { title: '10% Saver Club', desc: 'Achieved consumption drop over baseline', unlocked: goals.some((g) => (g.progressPercent || 0) >= 100), icon: Award },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Household Energy Savings Goals
            </h1>
            <Badge variant="success">Energy Efficiency</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Establish consumption reduction milestones and track real meter progress towards lower electricity bills.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Create Savings Target
        </Button>
      </div>

      {/* GAMIFICATION MILESTONE BADGES */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>Efficiency Milestones &amp; Achievement Badges</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border text-center space-y-2 transition ${
                  b.unlocked
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <div
                  className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center ${
                    b.unlocked
                      ? 'bg-emerald-500 text-white shadow-glow-green'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">{b.title}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIVE GOALS CARDS */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Active Reduction Goals ({goals.length})
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            ))}
          </div>
        ) : goals.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400 text-xs">
            No energy reduction goals set yet. Click "Create Savings Target" to set your first goal.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((g) => {
              const isAchieved = g.status === 'achieved' || (g.progressPercent || 0) >= 100;
              const targetReductionKwh = Math.round((g.baselineConsumption - g.targetConsumption) * 10) / 10;

              return (
                <div
                  key={g._id}
                  className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">{g.name}</h4>
                        <span className="text-xs text-slate-400 font-medium">{g.targetPeriod}</span>
                      </div>
                      <Badge variant={isAchieved ? 'success' : 'neutral'} size="sm">
                        {isAchieved ? 'Achieved ✓' : 'In Progress'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Baseline</span>
                        <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                          {g.baselineConsumption} kWh
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
                        <span className="text-[10px] text-emerald-600 uppercase font-bold">Target</span>
                        <p className="font-mono font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                          {g.targetConsumption} kWh
                        </p>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50">
                        <span className="text-[10px] text-blue-600 uppercase font-bold">Goal Cut</span>
                        <p className="font-mono font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                          -{targetReductionKwh} kWh
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500">Milestone Progress</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                          {g.progressPercent || 0}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, g.progressPercent || 0)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Deadline: {new Date(g.deadline).toLocaleDateString()}</span>
                    </div>

                    <button
                      onClick={() => handleDelete(g._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Remove Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create Goal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Establish Household Energy Target"
        description="Set a measurable baseline and target kWh reduction"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Goal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Keep November Cycle Under 220 kWh"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Baseline (kWh) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="1"
                required
                value={baselineConsumption}
                onChange={(e) => setBaselineConsumption(e.target.value)}
                placeholder="245"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target (kWh) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={targetConsumption}
                onChange={(e) => setTargetConsumption(e.target.value)}
                placeholder="220"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Period Label
              </label>
              <input
                type="text"
                required
                value={targetPeriod}
                onChange={(e) => setTargetPeriod(e.target.value)}
                placeholder="e.g. November 2026"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Deadline Date
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              Establish Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
