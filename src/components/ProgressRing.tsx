// ============================================
// NutriLens - Progress Ring Component
// Animated circular progress indicator for calorie tracking
// ============================================

'use client';

import { useEffect, useState } from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  current: number;
  goal: number;
  label: string;
}

export default function ProgressRing({
  percentage,
  size = 200,
  strokeWidth = 14,
  current,
  goal,
  label,
}: ProgressRingProps) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getColor = () => {
    if (percentage >= 100) return '#ef4444'; // red - over limit
    if (percentage >= 80) return '#f59e0b';  // amber - approaching
    return '#10b981';                         // green - on track
  };

  return (
    <div
      className="flex flex-col items-center"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={goal}
      aria-label={`${label}: ${current} of ${goal}`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-white/10"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${getColor()}40)`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-3xl font-bold text-white">{current.toLocaleString()}</span>
        <span className="text-sm text-white/60">/ {goal.toLocaleString()} kcal</span>
      </div>
    </div>
  );
}
