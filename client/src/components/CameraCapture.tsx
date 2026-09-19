import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Upload, AlertCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface CameraCaptureProps {
  onPhotoCaptured: (base64Image: string | null) => void;
  required?: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onPhotoCaptured, required = false }) => {
  const { t } = useLanguage();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startCamera = async (facing: 'user' | 'environment' = 'user') => {
    stopCamera();
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      setStream(mediaStream);
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access denied/failed:', err);
      setCameraError('Camera access unavailable or permission denied. You can upload a photo instead.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    onPhotoCaptured(null);
    startCamera(facingMode);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onPhotoCaptured(capturedImage);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setCameraError('Image file size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCapturedImage(result);
        onPhotoCaptured(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 flex items-center justify-center gap-2">
        <Camera className="w-5 h-5 text-blue-600" />
        {t('visitor_photo', 'Visitor Photo')}
        {!required && <span className="text-xs font-normal text-slate-500">({t('skip_photo', 'Optional')})</span>}
      </h3>

      {cameraError && (
        <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs rounded-xl flex items-center gap-2 text-left">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Live Video Preview */}
      {cameraActive && (
        <div className="relative rounded-2xl overflow-hidden bg-black max-w-sm mx-auto shadow-inner aspect-[4/3]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-4 z-10">
            <button
              type="button"
              onClick={toggleCameraFacing}
              title="Flip camera"
              className="p-3 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={capturePhoto}
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              {t('capture', 'Capture')}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="p-3 bg-black/50 text-white rounded-full backdrop-blur-md hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <div className="max-w-xs mx-auto">
          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md aspect-[4/3] bg-black">
            <img src={capturedImage} alt="Visitor Preview" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1 rounded-full">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-3">
            <button
              type="button"
              onClick={retakePhoto}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              {t('retake', 'Retake')}
            </button>
            <button
              type="button"
              onClick={confirmPhoto}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              {t('confirm', 'Confirmed')}
            </button>
          </div>
        </div>
      )}

      {/* Initial Buttons when no camera is active and no photo taken */}
      {!cameraActive && !capturedImage && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-3">
          <button
            type="button"
            onClick={() => startCamera(facingMode)}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
          >
            <Camera className="w-4 h-4" />
            {t('take_photo', 'Take Photo')}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition"
          >
            <Upload className="w-4 h-4" />
            {t('upload_photo', 'Upload File')}
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
