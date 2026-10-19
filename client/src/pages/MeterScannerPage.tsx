import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Image as ImageIcon,
  Zap,
  Receipt,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Sliders,
  ChevronDown,
  ChevronUp,
  Smartphone,
  ExternalLink,
  Flashlight,
  Sparkles,
  Info,
  Keyboard,
  Calendar,
  FileText,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../services/authContext.js';
import { api } from '../services/api.js';
import { OcrResponse, OcrCandidate } from '../types/index.js';

export const MeterScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeMeter, meters, setActiveMeter, refreshUser, user } = useAuth();

  // Dual Entry Mode: 'scan' (Google Lens Camera) | 'manual' (Direct Typing Counter)
  const [entryMode, setEntryMode] = useState<'scan' | 'manual'>('scan');

  // Scanning & Detection State
  const [isScanning, setIsScanning] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResponse | null>(null);
  const [scanError, setScanError] = useState<string>('');

  // Auto-Saved Result State (Google Lens Bottom Sheet)
  const [savedReading, setSavedReading] = useState<number | null>(null);
  const [unitsConsumed, setUnitsConsumed] = useState<number>(0);
  const [estimatedBill, setEstimatedBill] = useState<number | null>(null);
  const [isDuplicateScan, setIsDuplicateScan] = useState<boolean>(false);
  const [copiedValue, setCopiedValue] = useState(false);

  // Live Camera WebRTC Stream State
  const [isCameraStreaming, setIsCameraStreaming] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Native Inputs
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Manual Adjustment Sheet (Post-Scan)
  const [showManualEdit, setShowManualEdit] = useState(false);
  const [manualInputValue, setManualInputValue] = useState('');
  const [isSavingManual, setIsSavingManual] = useState(false);

  // Direct Manual Typing Mode State
  const [directReadingVal, setDirectReadingVal] = useState<string>('');
  const [directReadingDate, setDirectReadingDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [directNotes, setDirectNotes] = useState<string>('');
  const [isSavingDirect, setIsSavingDirect] = useState<boolean>(false);
  const [directError, setDirectError] = useState<string>('');
  const [showRolloverPrompt, setShowRolloverPrompt] = useState<boolean>(false);
  const [allowRollover, setAllowRollover] = useState<boolean>(false);

  // Trigger Device Haptic Feedback
  const triggerHaptic = (pattern: number | number[] = [30, 50, 30]) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (_) {}
  };

  // Start Live Camera on Mount if in Scan Mode
  useEffect(() => {
    if (entryMode === 'scan') {
      startCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [entryMode]);

  const startCameraStream = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsCameraStreaming(false);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setIsCameraStreaming(true);
      setScanError('');
    } catch (err: any) {
      console.warn('Live camera stream not directly accessible, will use native camera capture:', err);
      setIsCameraStreaming(false);
    }
  };

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraStreaming(false);
  };

  const toggleTorch = async () => {
    try {
      if (mediaStreamRef.current) {
        const track = mediaStreamRef.current.getVideoTracks()[0];
        const capabilities = (track.getCapabilities && track.getCapabilities()) || {};
        if ((capabilities as any).torch) {
          const nextState = !torchOn;
          await track.applyConstraints({
            advanced: [{ torch: nextState } as any],
          });
          setTorchOn(nextState);
          triggerHaptic(40);
        }
      }
    } catch (err) {
      console.warn('Torch toggle not supported on this device:', err);
    }
  };

  // Adjust direct reading via steppers (+/-)
  const adjustDirectReading = (delta: number) => {
    const current = parseFloat(directReadingVal) || 0;
    const next = Math.max(0, parseFloat((current + delta).toFixed(2)));
    setDirectReadingVal(next.toString());
    triggerHaptic(20);
  };

  // Capture Live Frame from Video Element
  const handleShutterClick = () => {
    triggerHaptic([40, 80]);
    if (isCameraStreaming && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        fetch(dataUrl)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], `meter_lens_${Date.now()}.jpg`, { type: 'image/jpeg' });
            runLensDetection(file, dataUrl);
          });
        return;
      }
    }

    // Fallback: Launch native mobile camera
    nativeCameraInputRef.current?.click();
  };

  // Handle native camera or gallery selection
  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        runLensDetection(file, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // GOOGLE LENS PIPELINE: AUTO-DETECT & AUTO-COMMIT
  const runLensDetection = async (file: File, previewUrl: string) => {
    setImagePreviewUrl(previewUrl);
    setIsScanning(true);
    setScanError('');
    setSavedReading(null);
    setIsDuplicateScan(false);

    try {
      // Step 1: Extract Reading with OCR Vision
      const formData = new FormData();
      formData.append('meterPhoto', file);
      const res = await api.scanMeter(formData);

      if (!res || !res.success || !res.data) {
        throw new Error(res?.message || 'Could not recognize meter digits. Please aim closer and keep camera steady.');
      }

      const ocrData: OcrResponse = res.data;
      setOcrResult(ocrData);

      if (ocrData.extractedReading === null) {
        throw new Error(ocrData.message || 'Counter numbers were blurry. Please align the meter counter in the center and tap to re-scan.');
      }

      const detectedVal = ocrData.extractedReading;
      setManualInputValue(detectedVal.toString());

      // Step 2: AUTO-COMMIT DIRECTLY TO DATABASE
      const targetMeterId = activeMeter?._id || meters[0]?._id;
      if (!targetMeterId) {
        throw new Error('No registered electricity meter found.');
      }

      const saveRes = await api.createReading({
        meterId: targetMeterId,
        readingValue: detectedVal,
        readingDate: new Date().toISOString().slice(0, 10),
        source: 'ocr',
        verificationStatus: 'verified',
        confidence: ocrData.confidence || 100,
        notes: `Google Lens Scanner Auto-Saved (${(ocrData as any).meterType || 'Electricity Meter'})`,
        allowRolloverOrReset: true,
      });

      if (saveRes.success) {
        setSavedReading(detectedVal);
        setUnitsConsumed(saveRes.unitsConsumed || detectedVal);
        setEstimatedBill(saveRes.estimatedBill || null);
        setIsDuplicateScan(Boolean(saveRes.isDuplicate));
        triggerHaptic([60, 120, 60]);
        await refreshUser();
      } else {
        throw new Error(saveRes.message || 'Failed to auto-save meter reading.');
      }
    } catch (err: any) {
      console.error('Google Lens Scan error:', err);
      setScanError(err.message || 'Detection failed. Please ensure the counter is well illuminated.');
      triggerHaptic([120, 60, 120]);
    } finally {
      setIsScanning(false);
    }
  };

  // Direct Manual Form Submission Handler
  const handleDirectManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(directReadingVal);
    if (isNaN(val) || val < 0) {
      setDirectError('Please enter a valid non-negative meter reading.');
      return;
    }

    const targetMeterId = activeMeter?._id || meters[0]?._id;
    if (!targetMeterId) {
      setDirectError('No registered electricity meter found.');
      return;
    }

    setIsSavingDirect(true);
    setDirectError('');

    try {
      const res = await api.createReading({
        meterId: targetMeterId,
        readingValue: val,
        readingDate: directReadingDate,
        source: 'manual',
        verificationStatus: 'verified',
        confidence: 100,
        notes: directNotes || 'Manual meter entry',
        allowRolloverOrReset: allowRollover || true,
      });

      if (res.success) {
        setSavedReading(val);
        setManualInputValue(val.toString());
        setUnitsConsumed(res.unitsConsumed || val);
        setEstimatedBill(res.estimatedBill || null);
        setIsDuplicateScan(Boolean(res.isDuplicate));
        triggerHaptic([60, 120, 60]);
        await refreshUser();
      } else {
        throw new Error(res.message || 'Failed to record meter reading.');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('lower than previous')) {
        setShowRolloverPrompt(true);
      }
      setDirectError(err.message || 'Failed to record meter reading.');
      triggerHaptic([120, 60, 120]);
    } finally {
      setIsSavingDirect(false);
    }
  };

  // 1-Tap Candidate Switch
  const handleSelectCandidate = async (cand: OcrCandidate) => {
    if (!cand || cand.value === savedReading) return;
    setIsScanning(true);
    triggerHaptic(40);
    try {
      const targetMeterId = activeMeter?._id || meters[0]?._id;
      const saveRes = await api.createReading({
        meterId: targetMeterId,
        readingValue: cand.value,
        readingDate: new Date().toISOString().slice(0, 10),
        source: 'ocr',
        verificationStatus: 'verified',
        confidence: cand.confidence || 100,
        notes: `Candidate switch: ${cand.label}`,
        allowRolloverOrReset: true,
      });

      if (saveRes.success) {
        setSavedReading(cand.value);
        setManualInputValue(cand.value.toString());
        setUnitsConsumed(saveRes.unitsConsumed || cand.value);
        setEstimatedBill(saveRes.estimatedBill || null);
        await refreshUser();
      }
    } catch (err: any) {
      setScanError(err.message || 'Failed to switch reading.');
    } finally {
      setIsScanning(false);
    }
  };

  // Post-Scan Manual Override Submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualInputValue);
    if (isNaN(val) || val < 0) {
      setScanError('Please enter a valid reading number.');
      return;
    }

    setIsSavingManual(true);
    setScanError('');
    try {
      const targetMeterId = activeMeter?._id || meters[0]?._id;
      const saveRes = await api.createReading({
        meterId: targetMeterId,
        readingValue: val,
        readingDate: new Date().toISOString().slice(0, 10),
        source: 'manual',
        verificationStatus: 'verified',
        confidence: 100,
        notes: 'Manual edit via Lens',
        allowRolloverOrReset: true,
      });

      if (saveRes.success) {
        setSavedReading(val);
        setUnitsConsumed(saveRes.unitsConsumed || val);
        setEstimatedBill(saveRes.estimatedBill || null);
        setShowManualEdit(false);
        await refreshUser();
      }
    } catch (err: any) {
      setScanError(err.message || 'Failed to update reading.');
    } finally {
      setIsSavingManual(false);
    }
  };

  const copyReadingNumber = () => {
    if (savedReading !== null) {
      navigator.clipboard.writeText(savedReading.toString());
      setCopiedValue(true);
      triggerHaptic(40);
      setTimeout(() => setCopiedValue(false), 2000);
    }
  };

  const resetToCamera = () => {
    setImagePreviewUrl(null);
    setOcrResult(null);
    setSavedReading(null);
    setEstimatedBill(null);
    setScanError('');
    setShowManualEdit(false);
    setDirectError('');
    setShowRolloverPrompt(false);
    setEntryMode('scan');
    if (!isCameraStreaming) {
      startCameraStream();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto min-h-[calc(100dvh-5.5rem)] flex flex-col justify-between overflow-hidden bg-black text-white rounded-2xl sm:rounded-3xl sm:border sm:border-slate-800 shadow-2xl select-none">
      {/* Hidden Native Inputs */}
      <input
        ref={nativeCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChosen}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        onChange={handleFileChosen}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* TOP HEADER BAR */}
      <div className="relative z-20 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-[2px] gap-2 min-w-0">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shrink-0">
            {entryMode === 'scan' ? (
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            ) : (
              <Keyboard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold tracking-wide text-white truncate">
              {entryMode === 'scan' ? 'Smart Meter Scanner' : 'Manual Reading Entry'}
            </div>
            <div className="text-[10px] text-white/60 truncate hidden xs:block">
              {entryMode === 'scan' ? 'AI OCR Meter Recognition' : 'Direct Electric Counter Typing'}
            </div>
          </div>
        </div>

        {/* Active Meter Dropdown / Pill */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {meters.length > 1 ? (
            <select
              value={activeMeter?._id || ''}
              onChange={(e) => {
                const m = meters.find((x) => x._id === e.target.value);
                if (m) setActiveMeter(m);
              }}
              className="text-[10px] sm:text-[11px] bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2.5 sm:px-3 py-1 text-white font-medium focus:outline-none max-w-[120px] sm:max-w-[180px] truncate"
            >
              {meters.map((m) => (
                <option key={m._id} value={m._id} className="bg-slate-900 text-white">
                  {m.meterName}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-[10px] sm:text-[11px] bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2.5 sm:px-3 py-1 text-white/90 font-medium flex items-center gap-1 max-w-[120px] sm:max-w-[180px] truncate">
              <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{activeMeter?.meterName || 'Main Meter'}</span>
            </div>
          )}

          {/* Torch Toggle Button (Only in camera scan mode) */}
          {entryMode === 'scan' && isCameraStreaming && (
            <button
              onClick={toggleTorch}
              className={`p-1.5 sm:p-2 rounded-full border backdrop-blur-md transition-all shrink-0 ${
                torchOn
                  ? 'bg-amber-400 text-black border-amber-300'
                  : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'
              }`}
              title="Toggle Flashlight"
            >
              <Flashlight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* DUAL MODE SELECTOR TABS (Camera Scanner vs Manual Typing) */}
      {savedReading === null && (
        <div className="relative z-20 px-3 sm:px-4 pb-2.5 pt-0 flex items-center justify-center">
          <div className="inline-flex p-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 gap-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setEntryMode('scan');
                triggerHaptic(20);
                if (!isCameraStreaming) startCameraStream();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                entryMode === 'scan'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEntryMode('manual');
                triggerHaptic(20);
                stopCameraStream();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                entryMode === 'manual'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Type Reading</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT: CAMERA SCANNER OR DIRECT MANUAL TYPING CONSOLE */}
      {savedReading === null && entryMode === 'scan' ? (
        /* CAMERA SCANNER VIEWPORT */
        <div className="relative flex-1 w-full min-h-[380px] sm:min-h-[460px] flex items-center justify-center overflow-hidden">
          {/* Live Camera Stream Video */}
          {isCameraStreaming && !imagePreviewUrl ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : imagePreviewUrl ? (
            <img
              src={imagePreviewUrl}
              alt="Scanned Meter"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">Camera Viewfinder</div>
                <p className="text-xs text-white/60 max-w-xs">
                  Tap the shutter below or upload a photo to scan your electric meter digits.
                </p>
              </div>
            </div>
          )}

          {/* GOOGLE LENS TARGETING RETICLE & CORNER BRACKETS */}
          <div className="absolute inset-x-5 inset-y-10 sm:inset-x-20 sm:inset-y-24 pointer-events-none flex flex-col justify-between z-10">
            {/* Top Corners */}
            <div className="flex justify-between items-start">
              <div className="w-7 h-7 sm:w-9 sm:h-9 border-t-[3.5px] border-l-[3.5px] border-white/90 rounded-tl-xl sm:rounded-tl-2xl shadow-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
              <div className="w-7 h-7 sm:w-9 sm:h-9 border-t-[3.5px] border-r-[3.5px] border-white/90 rounded-tr-xl sm:rounded-tr-2xl shadow-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
            </div>

            {/* Shimmering Center Lens Pulse Dots */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {/* Holographic Laser Bar */}
              {isScanning && (
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_16px_#22C55E] animate-laser" />
              )}

              {/* Google Lens Ambient AR Box */}
              <div className="relative border border-white/20 rounded-2xl px-3.5 sm:px-6 py-2 sm:py-3.5 bg-black/30 backdrop-blur-[2px] flex items-center justify-center max-w-[92%] mx-auto">
                <span className="text-[10px] sm:text-xs font-mono tracking-wider sm:tracking-widest text-white/90 uppercase whitespace-nowrap">
                  {isScanning ? 'DETECTING DIGITS' : 'ALIGN METER NUMBERS'}
                </span>
              </div>
            </div>

            {/* Bottom Corners */}
            <div className="flex justify-between items-end">
              <div className="w-7 h-7 sm:w-9 sm:h-9 border-b-[3.5px] border-l-[3.5px] border-white/90 rounded-bl-xl sm:rounded-bl-2xl shadow-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
              <div className="w-7 h-7 sm:w-9 sm:h-9 border-b-[3.5px] border-r-[3.5px] border-white/90 rounded-br-xl sm:rounded-br-2xl shadow-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
            </div>
          </div>

          {/* SCANNING STATUS PILL */}
          {isScanning && (
            <div className="absolute top-16 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 backdrop-blur-md border border-white/20 shadow-2xl">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span className="text-xs font-semibold text-white tracking-wide">
                Analyzing meter display...
              </span>
            </div>
          )}

          {/* ERROR SNACKBAR */}
          {scanError && (
            <div className="absolute bottom-24 inset-x-4 z-30 p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500/50 backdrop-blur-md text-rose-200 text-xs shadow-2xl flex items-center justify-between gap-3 animate-ar-pop">
              <div className="flex items-center gap-2 flex-1">
                <Info className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{scanError}</span>
              </div>
              <button
                onClick={() => {
                  setScanError('');
                  nativeCameraInputRef.current?.click();
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] shrink-0"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      ) : savedReading === null && entryMode === 'manual' ? (
        /* DIRECT MANUAL TYPING CONSOLE */
        <div className="flex-1 w-full p-4 sm:p-6 flex flex-col justify-center items-center overflow-y-auto">
          <form onSubmit={handleDirectManualSubmit} className="w-full max-w-md space-y-4">
            {/* Header / Subtitle */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <Zap className="w-3.5 h-3.5" />
                <span>Manual Reading Typing</span>
              </div>
              <p className="text-xs text-white/60">
                Type the counter digits displayed on your electric meter counter
              </p>
            </div>

            {/* Error Message */}
            {directError && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">{directError}</div>
              </div>
            )}

            {/* Rollover Prompt if Reading < Previous */}
            {showRolloverPrompt && (
              <div className="p-3 bg-amber-950/70 border border-amber-500/40 rounded-xl text-xs text-amber-200 space-y-2">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Lower than previous reading</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowRollover}
                    onChange={(e) => setAllowRollover(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-400 bg-black/40 border-white/20"
                  />
                  <span>Yes, my meter rolled over (passed 99999) or was replaced.</span>
                </label>
              </div>
            )}

            {/* HIGH-CONTRAST DIGITAL LCD METER COUNTER DISPLAY */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.12)] space-y-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 tracking-wider uppercase">
                <span>ELECTRICITY METER DISPLAY</span>
                <span className="text-emerald-400 font-mono">ACTIVE kWh</span>
              </div>

              {/* Main Numeric Counter Input Field */}
              <div className="relative flex items-center justify-center">
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  autoFocus
                  value={directReadingVal}
                  onChange={(e) => setDirectReadingVal(e.target.value)}
                  placeholder="00000.0"
                  className="w-full text-center text-3xl sm:text-4xl font-mono font-black text-emerald-400 bg-black/60 border border-emerald-500/40 rounded-2xl py-3 px-4 tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-white/20 shadow-inner"
                />
                <span className="absolute right-4 text-sm font-bold text-white/60 pointer-events-none">
                  kWh
                </span>
              </div>

              {/* Quick Stepper Adjusters (-100, -10, -1, +1, +10, +100) */}
              <div className="grid grid-cols-6 gap-1 pt-1">
                {[-100, -10, -1, 1, 10, 100].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => adjustDirectReading(delta)}
                    className="py-1.5 px-0.5 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10 text-[11px] font-mono text-white/80 hover:text-white transition-all text-center"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reading Date */}
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  Reading Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
                  <input
                    type="date"
                    required
                    value={directReadingDate}
                    onChange={(e) => setDirectReadingDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              {/* Target Meter Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1">
                  Target Meter
                </label>
                <select
                  value={activeMeter?._id || ''}
                  onChange={(e) => {
                    const m = meters.find((x) => x._id === e.target.value);
                    if (m) setActiveMeter(m);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {meters.map((m) => (
                    <option key={m._id} value={m._id} className="bg-slate-900 text-white">
                      {m.meterName} ({m.meterIdentifier || 'LT'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-white/70 mb-1">
                Notes (Optional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
                <input
                  type="text"
                  value={directNotes}
                  onChange={(e) => setDirectNotes(e.target.value)}
                  placeholder="e.g. Monthly utility bill reading verification"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white/5 border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>

            {/* Submit & Switch Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={isSavingDirect || !directReadingVal}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
              >
                {isSavingDirect ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Recording & Calculating Bill...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Record Reading & Calculate Bill</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEntryMode('scan');
                  triggerHaptic(20);
                  startCameraStream();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Switch to Camera Scanner</span>
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* GOOGLE LENS SLIDE-UP BOTTOM SHEET (When Reading is Saved) */}
      {savedReading !== null && (
        <div className="relative z-30 w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black border-t border-slate-800 rounded-t-3xl p-5 sm:p-6 shadow-2xl animate-slide-up space-y-4">
          {/* Centered Drag Handle */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto" />

          {/* Title & Status */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-white/50 uppercase tracking-widest">
                Electric Meter Counter
              </div>
              <div className="text-xs text-white/80 font-medium">
                {activeMeter?.meterName || 'Home Meter'} ({activeMeter?.meterIdentifier || 'LT-01'})
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
              <Check className="w-3.5 h-3.5" />
              <span>{isDuplicateScan ? 'Already Logged' : 'Auto-Saved'}</span>
            </div>
          </div>

          {/* Hero Numbers: Large kWh & Estimated Bill */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-1">
            {/* Left: Scanned/Entered kWh */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-0.5 sm:space-y-1 min-w-0">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50 font-semibold truncate">
                Detected Reading
              </div>
              <div className="text-xl xs:text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight truncate flex items-baseline">
                <span className="truncate">{savedReading}</span>
                <span className="text-xs sm:text-sm font-semibold text-white/70 ml-1 font-sans shrink-0">kWh</span>
              </div>
            </div>

            {/* Right: Calculated Electricity Bill */}
            <div className="p-3 sm:p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-0.5 sm:space-y-1 min-w-0">
              <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/50 font-semibold truncate">
                Estimated Bill
              </div>
              <div className="text-xl xs:text-2xl sm:text-3xl font-black text-white tracking-tight truncate">
                ₹{estimatedBill !== null ? estimatedBill.toLocaleString('en-IN') : '...'}
              </div>
              <div className="text-[9px] sm:text-[10px] text-emerald-400 font-medium truncate">
                {user?.locationPreferences?.distributionCompany || 'TANGEDCO'} Slab
              </div>
            </div>
          </div>

          {/* Horizontal Action Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar touch-pan-x">
            {/* Primary Action: Go to Dashboard */}
            <button
              onClick={() => navigate('/app')}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              View Dashboard
            </button>

            {/* Copy Reading Number */}
            <button
              onClick={copyReadingNumber}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 border border-white/10 transition-all"
            >
              {copiedValue ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedValue ? 'Copied' : 'Copy kWh'}
            </button>

            {/* Record Another Button */}
            <button
              onClick={resetToCamera}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 border border-white/10 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Record Another
            </button>

            {/* Candidate Chips (If multiple interpretations were detected via OCR) */}
            {ocrResult?.candidates &&
              ocrResult.candidates.map((cand, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectCandidate(cand)}
                  className={`px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full text-xs font-mono font-medium shrink-0 border transition-all ${
                    cand.value === savedReading
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 border-white/10'
                  }`}
                >
                  {cand.value} kWh {cand.value === savedReading && '✓'}
                </button>
              ))}

            {/* Manual Edit Toggle Chip */}
            <button
              onClick={() => setShowManualEdit(!showManualEdit)}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium flex items-center gap-1.5 shrink-0 border border-white/10"
            >
              <Sliders className="w-3.5 h-3.5" />
              Edit Manually
            </button>
          </div>

          {/* Collapsible Post-Scan Manual Edit Drawer */}
          {showManualEdit && (
            <form onSubmit={handleManualSubmit} className="pt-2 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={manualInputValue}
                  onChange={(e) => setManualInputValue(e.target.value)}
                  placeholder="Enter correct kWh"
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 min-w-0"
                />
                <button
                  type="submit"
                  disabled={isSavingManual}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0"
                >
                  {isSavingManual ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* GOOGLE LENS CAMERA CONTROLS (Active Viewfinder Bottom Bar in Scan Mode) */}
      {savedReading === null && entryMode === 'scan' && (
        <div className="relative z-20 w-full bg-gradient-to-t from-black via-black/80 to-transparent p-4 sm:p-6 pb-6 flex flex-col items-center gap-3">
          {/* Quick Manual Entry Switch Pill directly above Shutter */}
          <button
            type="button"
            onClick={() => {
              setEntryMode('manual');
              triggerHaptic(30);
              stopCameraStream();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white/90 hover:text-white text-xs font-medium shadow-md transition-all active:scale-95"
          >
            <Keyboard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Type Reading Manually</span>
          </button>

          <div className="w-full flex items-center justify-around max-w-xs sm:max-w-sm">
            {/* Gallery Upload Button (Left) */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              disabled={isScanning}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/80 transition-all active:scale-95 shrink-0"
              title="Pick Photo from Gallery"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            {/* ICONIC GOOGLE LENS SHUTTER BUTTON (Center) */}
            <button
              onClick={handleShutterClick}
              disabled={isScanning}
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/40 flex items-center justify-center p-1.5 transition-all active:scale-90 group shrink-0"
              title="Capture & Detect Meter Reading"
            >
              {/* Outer Glow Halo */}
              <div className="absolute inset-0 rounded-full bg-white/10 group-hover:bg-white/20 transition-all" />

              {/* Inner Solid Shutter Disk */}
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-slate-950 shadow-2xl transition-transform group-hover:scale-95">
                <Camera className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </button>

            {/* Mobile Native Camera Direct Trigger (Right) */}
            <button
              onClick={() => nativeCameraInputRef.current?.click()}
              disabled={isScanning}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white/80 transition-all active:scale-95 shrink-0"
              title="Launch Phone Native Camera"
            >
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeterScannerPage;
