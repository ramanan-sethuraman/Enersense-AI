import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanLine,
  Receipt,
  Cpu,
  Sparkles,
  TrendingUp,
  History,
  Target,
  FileText,
  Settings,
  Radio,
  X,
} from 'lucide-react';
import { Logo } from './Logo.js';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { label: 'Dashboard', path: '/app', icon: LayoutDashboard },
    { label: 'Meter Scanner', path: '/app/meter-scanner', icon: ScanLine, badge: 'OCR' },
    { label: 'Electricity Bills', path: '/app/bills', icon: Receipt },
    { label: 'Appliance Analysis', path: '/app/appliances', icon: Cpu },
    { label: 'AI Energy Advisor', path: '/app/ai-advisor', icon: Sparkles, badge: 'AI' },
    { label: 'Bill Prediction', path: '/app/prediction', icon: TrendingUp },
    { label: 'Usage History', path: '/app/history', icon: History },
    { label: 'Savings Goals', path: '/app/goals', icon: Target },
    { label: 'Reports', path: '/app/reports', icon: FileText },
    { label: 'Smart Meter & IoT', path: '/app/iot', icon: Radio },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-black border-r border-slate-200 dark:border-neutral-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100 dark:border-neutral-800">
          <NavLink to="/app" onClick={onClose}>
            <Logo size="sm" showTagline />
          </NavLink>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/app'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0 text-inherit" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Brand Info */}
        <div className="p-4 border-t border-slate-100 dark:border-neutral-800">
          <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/30 dark:to-neutral-900/40 rounded-xl border border-emerald-500/20">
            <div className="mb-1">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                Tariff Aware AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Real household consumption models without fake numbers.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
