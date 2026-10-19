import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  subtitle?: string;
  accent?: 'green' | 'blue' | 'amber' | 'slate';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  change,
  changeLabel,
  subtitle,
  accent = 'green',
}) => {
  const accentClasses = {
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border-blue-100 dark:border-blue-900/40',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border-amber-100 dark:border-amber-900/40',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };

  const isPositive = typeof change === 'number' && change > 0;
  const isNegative = typeof change === 'number' && change < 0;
  const isNeutral = typeof change === 'number' && change === 0;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 p-4 sm:p-5 shadow-soft hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 block truncate">
            {title}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5 sm:mt-2 flex-wrap">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              {value}
            </span>
            {unit && (
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                {unit}
              </span>
            )}
          </div>
        </div>

        <div className={`p-2.5 sm:p-3 rounded-xl border shrink-0 ${accentClasses[accent]}`}>
          {icon}
        </div>
      </div>

      {(typeof change === 'number' || subtitle) && (
        <div className="flex items-center gap-2 mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] sm:text-xs">
          {typeof change === 'number' && (
            <span
              className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[10px] sm:text-xs shrink-0 ${
                isNegative
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                  : isPositive
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {isNegative && <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />}
              {isPositive && <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />}
              {isNeutral && <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />}
              {Math.abs(change)}%
            </span>
          )}

          <span className="text-slate-500 dark:text-slate-400 truncate">
            {changeLabel || subtitle}
          </span>
        </div>
      )}
    </div>
  );
};
