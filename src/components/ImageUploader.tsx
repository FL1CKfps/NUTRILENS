// ============================================
// NutriLens - Image Uploader Component
// Drag & drop + camera capture for food images
// ============================================

'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading?: boolean;
}

export default function ImageUploader({ onImageSelected, isLoading }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelected(file);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-white/10">
          <img
            src={preview}
            alt="Selected food image ready for nutritional analysis"
            className="w-full aspect-video object-cover"
          />
          {!isLoading && (
            <button
              onClick={clearPreview}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white/80 hover:text-white hover:bg-black/80 transition-colors"
              aria-label="Remove selected image"
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-white/80 text-sm font-medium">Analyzing food...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
            isDragOver
              ? 'border-emerald-400 bg-emerald-400/10'
              : 'border-white/20 hover:border-white/40 bg-white/5'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload a food image. Click or drag and drop an image here."
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
              <ImageIcon size={28} className="text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-white/80 font-medium">Drop your food image here</p>
              <p className="text-white/40 text-sm mt-1">or click to browse • JPG, PNG, WebP</p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        aria-label="Upload food image from device"
      />

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
        aria-label="Capture food image using camera"
      />

      {!preview && (
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 font-medium transition-all duration-200 border border-white/10 hover:border-white/20"
            aria-label="Upload food image from gallery"
          >
            <Upload size={18} aria-hidden="true" />
            <span>Upload</span>
          </button>
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-[#0a0a0f] font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/25"
            aria-label="Take a photo of food using camera"
          >
            <Camera size={18} aria-hidden="true" />
            <span>Camera</span>
          </button>
        </div>
      )}
    </div>
  );
}
