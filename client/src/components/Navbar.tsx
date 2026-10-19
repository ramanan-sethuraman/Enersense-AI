import React, { useState } from 'react';
import { Menu, Sun, Moon, Bell, LogOut, ChevronDown, Gauge, Plus } from 'lucide-react';
import { useAuth } from '../services/authContext.js';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onOpenSidebar: () => void;
  onOpenAddReading?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSidebar, onOpenAddReading }) => {
  const { user, meters, activeMeter, setActiveMeter, theme, toggleTheme, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMeterMenu, setShowMeterMenu] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-black/90 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800">
      {/* Left: Mobile hamburger & Meter selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 -ml-2 text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Meter Selector */}
        {meters.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowMeterMenu(!showMeterMenu)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[200px]">
                {activeMeter?.meterName || 'Select Meter'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showMeterMenu && (
              <div className="absolute left-0 mt-2 w-56 p-1 bg-white dark:bg-[#0A0A0A] rounded-xl shadow-xl border border-slate-200 dark:border-neutral-800 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Your Electricity Meters
                </div>
                {meters.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => {
                      setActiveMeter(m);
                      setShowMeterMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition ${
                      activeMeter?._id === m._id
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate">{m.meterName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{m.meterIdentifier}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Actions, Theme, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenAddReading && (
          <button
            onClick={onOpenAddReading}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Reading</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Light/Dark Theme"
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Bell className="w-4 h-4" />
          </button>

          {showNotification && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 p-3 bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-xl border border-slate-200 dark:border-neutral-800 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Energy Alerts</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">1 New</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/40 text-slate-700 dark:text-slate-300">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Cycle Baseline Verified
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Your October reading was successfully reconciled with MSEDCL LT-I slabs.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 pl-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-green-600 text-white flex items-center justify-center font-bold text-[10px]">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'EA'}
            </div>
            <span className="hidden sm:inline-block truncate max-w-[100px]">
              {user?.name || 'User'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 p-1 bg-white dark:bg-[#0A0A0A] rounded-xl shadow-xl border border-slate-200 dark:border-neutral-800 z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-neutral-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {user?.locationPreferences?.state || 'Tamil Nadu'}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/app/settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Account Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
