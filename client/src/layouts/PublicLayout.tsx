import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Logo } from '../components/Logo.js';
import { Button } from '../components/Button.js';
import { useAuth } from '../services/authContext.js';
import { Sun, Moon } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { user, theme, toggleTheme } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 antialiased flex flex-col w-full overflow-x-hidden">
      {/* Public Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/90 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 min-w-0">
          <Link to="/" className="shrink-0">
            <Logo size="sm" showTagline />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              How It Works
            </a>
            <a href="#calculator" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              Tariff Estimator
            </a>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              onClick={toggleTheme}
              title="Toggle Light/Dark Theme"
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <Link to="/app">
                <Button variant="primary" size="sm" className="px-3 sm:px-4 text-xs sm:text-sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link to="/login" className="hidden sm:inline-block">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="px-3 sm:px-4 text-xs sm:text-sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Public Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="bg-white dark:bg-black border-t border-slate-200 dark:border-neutral-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="h-6 flex items-center mb-3">
              <Logo size="sm" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Enersense AI combines electricity meter automation, tariff-aware calculations, and personalized energy-efficiency analytics for sustainable living.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>Software-Only Meter Automation</li>
              <li>Progressive Slab Tariff Engine</li>
              <li>Multi-State DISCOM Intelligence</li>
              <li>Zero Extra Hardware Needed</li>
              <li>Accessible on Mobile & Desktop</li>
            </ul>
          </div>

          <div>
            <h5 className="h-6 flex items-center text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Capabilities
            </h5>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>Smart Meter OCR Scanner</li>
              <li>Slab-Aware Tariff Calculator</li>
              <li>Appliance Energy Profiling</li>
              <li>AI Efficiency Advisor</li>
              <li>Predictive Bill Forecasting</li>
              <li>Standby Phantom Load Audit</li>
              <li>Target Savings Goals & Badges</li>
              <li>Smart Meter IoT Telemetry Hub</li>
            </ul>
          </div>

          <div>
            <h5 className="h-6 flex items-center text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Supported Utilities
            </h5>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>TANGEDCO (Tamil Nadu)</li>
              <li>KSEB (Kerala)</li>
              <li>BESCOM (Karnataka)</li>
              <li>APCPDCL / APSPDCL (Andhra Pradesh)</li>
              <li>TGSPDCL / TSSPDCL (Telangana)</li>
              <li>MSEDCL (Maharashtra)</li>
              <li>BSES Rajdhani / Yamuna (Delhi)</li>
              <li>UPPCL (Uttar Pradesh)</li>
            </ul>
          </div>

          <div>
            <h5 className="h-6 flex items-center text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Privacy & Trust
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Meter photos are processed securely in temporary runtime storage without permanent third-party retention. Deterministic calculations are always clearly cited.
            </p>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>Zero Permanent Image Storage</li>
              <li>Deterministic Reduction Formulas</li>
              <li>Client-Side Privacy Controls</li>
              <li>Encrypted Local Session Vault</li>
              <li className="font-mono text-[11px] text-slate-400 pt-0.5">
                Enersense AI Core v1.0.0
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 dark:border-neutral-900 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Enersense AI. All Rights Are Reserved. Made In India (Tn).
        </div>
      </footer>
    </div>
  );
};
