import React, { useState } from 'react';
import {
  Settings,
  User as UserIcon,
  MapPin,
  Moon,
  Sun,
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useAuth } from '../services/authContext.js';
import { api } from '../services/api.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, theme, toggleTheme, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [state, setState] = useState(user?.locationPreferences?.state || 'Tamil Nadu');
  const [discom, setDiscom] = useState(user?.locationPreferences?.distributionCompany || 'TANGEDCO');
  const [area, setArea] = useState(user?.locationPreferences?.area || '');
  const [category, setCategory] = useState(user?.consumerCategory || 'Domestic Low Tension');
  const [currency, setCurrency] = useState(user?.settings?.currency || '₹');
  const [notifications, setNotifications] = useState(user?.settings?.notificationsEnabled ?? true);
  const [dataConsent, setDataConsent] = useState(user?.settings?.dataSharingConsent ?? false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Delete Account Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const discomOptions: Record<string, string[]> = {
    'Tamil Nadu': ['TANGEDCO'],
    Kerala: ['KSEB (Kerala State Electricity Board)'],
    Karnataka: ['BESCOM', 'MESCOM', 'HESCOM', 'CESC'],
    'Andhra Pradesh': ['APCPDCL', 'APSPDCL', 'APEPDCL'],
    Telangana: ['TGSPDCL (TSSPDCL)', 'TGNPDCL'],
    Maharashtra: ['MSEDCL', 'Tata Power (Mumbai)', 'Adani Electricity (Mumbai)', 'BEST'],
    Delhi: ['BSES Rajdhani', 'BSES Yamuna', 'TPDDL (Tata Power Delhi)'],
    'Uttar Pradesh': ['UPPCL', 'NPCL (Greater Noida)'],
    Gujarat: ['DGVCL', 'MGVCL', 'UGVCL', 'Torrent Power'],
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      const res = await api.updateSettings({
        name,
        locationPreferences: {
          state,
          distributionCompany: discom,
          area,
        },
        consumerCategory: category,
        settings: {
          currency,
          theme,
          notificationsEnabled: notifications,
          dataSharingConsent: dataConsent,
        },
      });

      if (res.success) {
        setSaveSuccess('Preferences and regional profile updated successfully.');
        await refreshUser();
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    window.open('/api/settings/export-data', '_blank');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      alert('Please type "delete" to confirm.');
      return;
    }
    setIsDeleting(true);
    try {
      await api.deleteAccount();
      alert('Your account and all consumption records have been deleted.');
      await logout();
      window.location.href = '/';
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings &amp; Preferences
          </h1>
          <Badge variant="neutral">Personalization</Badge>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account profile, utility tariff configuration, currency, and data privacy controls.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}
        {saveError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* SECTION 1: User Profile */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-emerald-600" />
            <span>User Profile Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Account ID)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Regional Electricity Distribution Configuration */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Regional Electricity Tariff Preferences</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                State / Union Territory
              </label>
              <select
                value={state}
                onChange={(e) => {
                  const s = e.target.value;
                  setState(s);
                  const opts = discomOptions[s] || ['Default Discom'];
                  setDiscom(opts[0]);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                {Object.keys(discomOptions).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Distribution Company (Discom)
              </label>
              <select
                value={discom}
                onChange={(e) => setDiscom(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                {(discomOptions[state] || ['Default Discom']).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Consumer Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. LT-I Residential"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Local Subdivision / Area
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Pune Urban Circle"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: System & Theme Preferences */}
        <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-600" />
            <span>Display &amp; Notification Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                <option value="₹">₹ (Indian Rupee - Default)</option>
                <option value="$">$ (US Dollar)</option>
                <option value="€">€ (Euro)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Interface Color Mode
              </label>
              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="button"
                  variant={theme === 'light' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (theme !== 'light') toggleTheme();
                  }}
                  icon={<Sun className="w-4 h-4" />}
                >
                  Light Mode
                </Button>
                <Button
                  type="button"
                  variant={theme === 'dark' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (theme !== 'dark') toggleTheme();
                  }}
                  icon={<Moon className="w-4 h-4" />}
                >
                  Dark Mode
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">Enable in-app energy surge &amp; slab crossover alerts</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={dataConsent}
                onChange={(e) => setDataConsent(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">
                Contribute anonymized household consumption metrics to national efficiency benchmarks
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={isSaving} icon={<Save className="w-4 h-4" />}>
            Save All Preferences
          </Button>
        </div>
      </form>

      {/* SECTION 4: Data Governance & Danger Zone */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Data Privacy, Export &amp; Account Control</span>
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Export Household Energy Data</h4>
            <p className="text-xs text-slate-500">
              Download complete JSON archive of meters, historical readings, appliances, and goals.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportData} icon={<Download className="w-4 h-4" />}>
            Download Archive (JSON)
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
          <div>
            <h4 className="text-sm font-bold text-rose-600">Delete Account &amp; Consumption Data</h4>
            <p className="text-xs text-slate-500">
              Permanently purge your account, meters, and readings from the database.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        description="This action is irreversible and purges all recorded meter logs"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Please type <strong className="text-rose-600 font-mono">delete</strong> below to permanently erase your account and all associated electricity records:
          </p>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type 'delete'"
            className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 rounded-xl font-mono focus:ring-2 focus:ring-rose-500"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
