import React, { useState, useEffect } from 'react';
import {
  Radio,
  Cpu,
  Wifi,
  Activity,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Server,
  Zap,
  Info,
} from 'lucide-react';
import { useAuth } from '../services/authContext.js';
import { api } from '../services/api.js';
import { Button } from '../components/Button.js';
import { Badge } from '../components/Badge.js';
import { Modal } from '../components/Modal.js';

export const IotPage: React.FC = () => {
  const { user } = useAuth();
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceId, setDeviceId] = useState(`ESP32-EM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [deviceName, setDeviceName] = useState('Home Mains CT Sensor');
  const [deviceType, setDeviceType] = useState('smart_meter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<string>('');

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res = await api.getIotDevices();
      if (res.success) {
        setDevices(res.devices || []);
      }
    } catch (err) {
      console.error('Error fetching IoT devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.registerIotDevice({
        deviceId,
        deviceName,
        deviceType,
      });
      setIsModalOpen(false);
      await loadDevices();
    } catch (err: any) {
      alert(err.message || 'Failed to register device');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateTelemetry = async (devId: string) => {
    setSimulating(true);
    setSimResult('');
    try {
      const voltage = 230 + Math.round((Math.random() * 6 - 3) * 10) / 10;
      const current = 5.2 + Math.round((Math.random() * 3 - 1.5) * 10) / 10;
      const power = Math.round(voltage * current);
      const res = await api.ingestTelemetry({
        deviceId: devId,
        voltage,
        current,
        activePowerWatts: power,
        cumulativeKwh: 13765.4,
      });
      if (res.success) {
        setSimResult(`Telemetry ingested: ${voltage}V • ${current}A • ${power}W (Status: Valid Quality).`);
      }
    } catch (err: any) {
      setSimResult('Telemetry ingestion failed: ' + err.message);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Smart Meter &amp; IoT Integration Layer
            </h1>
            <Badge variant="info">Future Hardware Ready</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Integration architecture for compatible smart energy meters, ESP32 current transformer clamps, and MQTT gateways.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Register IoT Device
        </Button>
      </div>

      {/* Software-Only Notice (Section 21) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-blue-950 dark:text-blue-200">
            Initial Release Scope Clarification:
          </span>
          <p className="leading-relaxed text-xs">
            Enersense AI operates 100% in software today using OCR meter photography and deterministic calculations. No proprietary hardware or smart meters are mandatory for core functionality. This module provides the telemetry protocol and data schema for future hardware integration.
          </p>
        </div>
      </div>

      {/* IoT Architecture Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">ESP32 &amp; CT Sensors</h4>
          <p className="text-xs text-slate-500">
            Non-invasive split-core current transformers (SCT-013) for panel-level mains logging.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Wifi className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">MQTT / REST Telemetry</h4>
          <p className="text-xs text-slate-500">
            Lightweight secure message broker ingest with schema validation and quality flags.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Smart Meter DLMS/COSEM</h4>
          <p className="text-xs text-slate-500">
            Prepared data contracts compliant with IS 16444 Indian smart metering standards.
          </p>
        </div>
      </div>

      {/* REGISTERED DEVICES LIST */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-soft space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>Configured Energy Telemetry Endpoints ({devices.length})</span>
        </h3>

        {simResult && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{simResult}</span>
          </div>
        )}

        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400">Loading devices...</div>
        ) : devices.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            No IoT devices paired yet. Click "Register IoT Device" to simulate an ESP32 or smart meter gateway.
          </div>
        ) : (
          <div className="space-y-3">
            {devices.map((dev) => (
              <div
                key={dev._id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">{dev.deviceName}</h5>
                    <p className="text-slate-400 font-mono text-[11px]">
                      ID: {dev.deviceId} • Type: {dev.deviceType} • FW: {dev.firmwareVersion}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    loading={simulating}
                    onClick={() => handleSimulateTelemetry(dev.deviceId)}
                    icon={<Zap className="w-3.5 h-3.5" />}
                  >
                    Simulate Ingest
                  </Button>
                  <Badge variant="success" size="sm">
                    Online
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal to Register Device */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pair Future Smart Meter / IoT Device"
        description="Register an energy gateway device identifier"
      >
        <form onSubmit={handleRegisterDevice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Device Name
            </label>
            <input
              type="text"
              required
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Device Hardware Identifier (UUID / MAC)
            </label>
            <input
              type="text"
              required
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Device Type
            </label>
            <select
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
            >
              <option value="smart_meter">Smart Electricity Meter (DLMS)</option>
              <option value="current_transformer">ESP32 + CT Sensor Clamp</option>
              <option value="smart_plug">Smart Plug Energy Monitor</option>
              <option value="esp32_gateway">Raspberry Pi Energy Gateway</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              Register Device
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
