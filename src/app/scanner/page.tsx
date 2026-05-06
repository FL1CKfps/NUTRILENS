// ============================================
// NutriLens - Food Scanner Page
// Upload/capture image → Vision API + Gemini analysis
// ============================================

'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import HealthBadge from '@/components/HealthBadge';
import { ScannerSkeleton } from '@/components/Skeletons';
import { addMeal } from '@/lib/store';
import { FoodScanResult } from '@/types';
import { Flame, Beef, Wheat, Droplets, Salad, Check, ScanLine } from 'lucide-react';

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const handleImageSelected = async (file: File) => {
    setIsScanning(true);
    setError(null);
    setScanResult(null);
    setSaved(false);
    setRetryAfterSeconds(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const isBusy = response.status === 429 || response.status === 503;
        const message = isBusy
          ? 'Gemini is experiencing high usage right now. The request was rate-limited by the AI provider. Please try again in a moment.'
          : (errorData.error || 'Failed to analyze food');
        if (typeof errorData.retryAfterSeconds === 'number') {
          setRetryAfterSeconds(Math.max(errorData.retryAfterSeconds, 1));
        }
        throw new Error(message);
      }

      const result: FoodScanResult = await response.json();
      setScanResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToLog = () => {
    if (!scanResult) return;

    addMeal({
      id: crypto.randomUUID(),
      dishName: scanResult.dishName,
      nutrition: scanResult.nutrition,
      healthRisk: scanResult.healthRisk,
      imageUrl: scanResult.imageUrl,
      timestamp: scanResult.timestamp,
    });

    setSaved(true);
    
    // Dispatch custom event for dashboard to listen to
    window.dispatchEvent(new Event('nutrilens-meal-added'));
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-2">
          <ScanLine size={14} aria-hidden="true" />
          AI Food Scanner
        </div>
        <h1 className="text-2xl font-bold text-white">Scan Your Food</h1>
        <p className="text-white/50 text-sm">
          Take a photo or upload an image to get instant nutrition analysis
        </p>
      </div>

      {/* Image Uploader */}
      <div className="glass-card-elevated p-5">
        <ImageUploader onImageSelected={handleImageSelected} isLoading={isScanning} />
      </div>

      {/* Loading State */}
      {isScanning && (
        <div className="glass-card p-5">
          <ScannerSkeleton />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="glass-card p-5 border-red-500/20"
          role="alert"
          aria-label="Scan error"
        >
          <div className="flex items-center gap-3 text-red-400">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <span className="text-lg" aria-hidden="true">⚠️</span>
            </div>
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p className="text-sm text-red-300/70 mt-0.5">{error}</p>
              {retryAfterSeconds !== null && (
                <p className="text-xs text-red-300/60 mt-1">Try again in ~{retryAfterSeconds}s.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scan Results */}
      {scanResult && !isScanning && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Dish Name */}
          <div className="glass-card-elevated p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold text-white">{scanResult.dishName}</h2>
              <span className="text-white/30 text-xs">
                {Math.round(scanResult.confidence * 100)}% confidence
              </span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000"
                style={{ width: `${scanResult.confidence * 100}%` }}
              />
            </div>
          </div>

          {/* Nutrition Breakdown */}
          <div className="glass-card p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Nutritional Breakdown</h3>
            <div className="grid grid-cols-2 gap-3">
              <NutritionStat
                icon={<Flame size={18} aria-hidden="true" />}
                label="Calories"
                value={scanResult.nutrition.calories}
                unit="kcal"
                color="amber"
              />
              <NutritionStat
                icon={<Beef size={18} aria-hidden="true" />}
                label="Protein"
                value={scanResult.nutrition.protein}
                unit="g"
                color="violet"
              />
              <NutritionStat
                icon={<Wheat size={18} aria-hidden="true" />}
                label="Carbs"
                value={scanResult.nutrition.carbs}
                unit="g"
                color="blue"
              />
              <NutritionStat
                icon={<Droplets size={18} aria-hidden="true" />}
                label="Fat"
                value={scanResult.nutrition.fat}
                unit="g"
                color="orange"
              />
              <NutritionStat
                icon={<Salad size={18} aria-hidden="true" />}
                label="Fiber"
                value={scanResult.nutrition.fiber}
                unit="g"
                color="emerald"
                fullWidth
              />
            </div>
          </div>

          {/* Health Risk Alert */}
          <HealthBadge healthRisk={scanResult.healthRisk} />

          {/* Save Button */}
          <button
            onClick={handleSaveToLog}
            disabled={saved}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              saved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-[#0a0a0f] shadow-lg shadow-emerald-500/25'
            }`}
            aria-label={saved ? 'Meal saved to your daily log' : 'Save this meal to your daily log'}
          >
            {saved ? (
              <>
                <Check size={18} aria-hidden="true" />
                Saved to Daily Log
              </>
            ) : (
              'Add to Daily Log'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// Nutrition stat card sub-component
function NutritionStat({
  icon,
  label,
  value,
  unit,
  color,
  fullWidth,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  color: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-white/5 border border-white/10 p-3.5 ${fullWidth ? 'col-span-2' : ''}`}
      aria-label={`${label}: ${value} ${unit}`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`text-${color}-400`}>{icon}</span>
        <span className="text-white/50 text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">
        {value}
        <span className="text-sm text-white/40 font-normal ml-1">{unit}</span>
      </p>
    </div>
  );
}
