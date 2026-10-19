import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../services/authContext.js';
import { Sidebar } from '../components/Sidebar.js';
import { Navbar } from '../components/Navbar.js';
import { Modal } from '../components/Modal.js';
import { Button } from '../components/Button.js';
import { api } from '../services/api.js';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, loading, activeMeter, refreshUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Add Reading Quick Modal State
  const [isAddReadingOpen, setIsAddReadingOpen] = useState(false);
  const [readingVal, setReadingVal] = useState('');
  const [readingDate, setReadingDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [allowRollover, setAllowRollover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showRolloverPrompt, setShowRolloverPrompt] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-black">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Loading Enersense AI...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleQuickAddReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMeter) {
      setErrorMsg('No electricity meter registered. Please add a meter in settings.');
      return;
    }
    const val = parseFloat(readingVal);
    if (isNaN(val) || val < 0) {
      setErrorMsg('Please enter a valid non-negative meter reading.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.createReading({
        meterId: activeMeter._id,
        readingValue: val,
        readingDate,
        source: 'manual',
        verificationStatus: 'verified',
        notes,
        allowRolloverOrReset: allowRollover,
      });

      if (res.success) {
        setSuccessMsg(`Reading of ${val} kWh recorded successfully! Units consumed: ${res.unitsConsumed || 0} kWh.`);
        setReadingVal('');
        setNotes('');
        setShowRolloverPrompt(false);
        setAllowRollover(false);
        await refreshUser();
        setTimeout(() => {
          setIsAddReadingOpen(false);
          setSuccessMsg('');
          window.location.reload(); // Refresh active dashboard view
        }, 1200);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('lower than previous')) {
        setShowRolloverPrompt(true);
      }
      setErrorMsg(err.message || 'Failed to record meter reading');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 antialiased flex flex-col w-full overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64 flex flex-col flex-1 w-full min-w-0">
        <Navbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenAddReading={() => {
            setErrorMsg('');
            setSuccessMsg('');
            setShowRolloverPrompt(false);
            setIsAddReadingOpen(true);
          }}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Quick Add Reading Modal */}
      <Modal
        isOpen={isAddReadingOpen}
        onClose={() => setIsAddReadingOpen(false)}
        title="Add Electricity Meter Reading"
        description={`Record current reading for ${activeMeter?.meterName || 'Primary Meter'}`}
      >
        <form onSubmit={handleQuickAddReading} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p>{errorMsg}</p>
                {showRolloverPrompt && (
                  <label className="flex items-center gap-2 mt-2 font-medium cursor-pointer text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={allowRollover}
                      onChange={(e) => setAllowRollover(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Yes, my meter rolled over or was replaced.</span>
                  </label>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Reading (kWh) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0"
              required
              value={readingVal}
              onChange={(e) => setReadingVal(e.target.value)}
              placeholder="e.g. 13840"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reading Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={readingDate}
              onChange={(e) => setReadingDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Monthly utility bill reading verification"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddReadingOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              Save Reading
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
