import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  ArrowUpDown,
  Download,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Filter,
} from 'lucide-react';
import { useAuth } from '../services/authContext.js';
import { api } from '../services/api.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';
import { Reading } from '../types/index.js';

export const UsageHistoryPage: React.FC = () => {
  const { user, activeMeter, meters } = useAuth();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'date_desc' | 'date_asc'>('date_desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Edit Modal State
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [editVal, setEditVal] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState('');

  const loadReadings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sortOrder) params.append('sort', sortOrder);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.getReadings(params.toString());
      if (res.success) {
        setReadings(res.readings || []);
      }
    } catch (err) {
      console.error('Error fetching readings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadings();
  }, [sortOrder, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReadings();
  };

  const openEdit = (reading: Reading) => {
    setEditingReading(reading);
    setEditVal(reading.readingValue.toString());
    setEditDate(new Date(reading.readingDate).toISOString().slice(0, 10));
    setEditNotes(reading.notes || '');
    setEditError('');
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReading) return;
    const val = parseFloat(editVal);
    if (isNaN(val) || val < 0) {
      setEditError('Reading must be a positive number.');
      return;
    }

    try {
      await api.updateReading(editingReading._id, {
        readingValue: val,
        readingDate: editDate,
        notes: editNotes,
      });
      setIsEditing(false);
      setEditingReading(null);
      await loadReadings();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update reading');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this meter reading? Dependent consumption records will be updated.')) {
      try {
        await api.deleteReading(id);
        await loadReadings();
      } catch (err: any) {
        alert(err.message || 'Failed to delete');
      }
    }
  };

  const handleExportCsv = () => {
    window.open(api.getReportCsvUrl(), '_blank');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Meter Reading &amp; Usage History
            </h1>
            <Badge variant="neutral">{readings.length} Logged</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete chronological ledger of manual entries, OCR scans, and IoT telemetry records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.assign('/app/meter-scanner')}
            icon={<Plus className="w-4 h-4" />}
          >
            New Reading
          </Button>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by notes, reading value, or source..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
            />
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'date_desc' ? 'date_asc' : 'date_desc')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-medium"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'date_desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* READINGS TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Reading Date</th>
                <th className="p-3.5">Meter Identifier</th>
                <th className="p-3.5">Cumulative (kWh)</th>
                <th className="p-3.5">Units Consumed</th>
                <th className="p-3.5">Source</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Notes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                    Loading records...
                  </td>
                </tr>
              ) : readings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-sans">
                    No matching meter readings found.
                  </td>
                </tr>
              ) : (
                readings.map((reading) => (
                  <tr key={reading._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-sans font-medium text-slate-900 dark:text-white">
                      {new Date(reading.readingDate).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-3.5 text-slate-500 font-sans">
                      {activeMeter?.meterIdentifier || 'Primary'}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {reading.readingValue} kWh
                    </td>
                    <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {reading.unitsConsumed ? `+${reading.unitsConsumed} kWh` : '0 kWh'}
                    </td>
                    <td className="p-3.5 font-sans">
                      <Badge
                        variant={reading.source === 'ocr' ? 'success' : reading.source === 'iot' ? 'info' : 'neutral'}
                        size="sm"
                      >
                        {reading.source.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-sans">
                      <Badge variant="success" size="sm">
                        Verified
                      </Badge>
                    </td>
                    <td className="p-3.5 font-sans text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {reading.notes || '—'}
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(reading)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(reading._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Reading Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Meter Reading Record"
        description="Recalculates dependent cycle consumption automatically"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {editError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs">
              {editError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reading Value (kWh)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              required
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reading Date
            </label>
            <input
              type="date"
              required
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notes
            </label>
            <input
              type="text"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
