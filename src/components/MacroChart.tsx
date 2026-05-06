// ============================================
// NutriLens - Macro Bar Chart Component
// Horizontal bar chart showing macro breakdown
// ============================================

'use client';

import { NutritionData, DailyGoal } from '@/types';
import { calculateGoalPercentage } from '@/lib/nutrition';

interface MacroChartProps {
  nutrition: NutritionData;
  goal: DailyGoal;
}

interface MacroBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
  unit: string;
}

function MacroBar({ label, current, max, color, unit }: MacroBarProps) {
  const percentage = calculateGoalPercentage(current, max);

  return (
    <div className="space-y-1.5" role="meter" aria-label={`${label}: ${current}${unit} of ${max}${unit}`} aria-valuenow={current} aria-valuemin={0} aria-valuemax={max}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-white/80 font-medium">{label}</span>
        <span className="text-white/60">
          {current}{unit} <span className="text-white/40">/ {max}{unit}</span>
        </span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
            boxShadow: `0 0 12px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

export default function MacroChart({ nutrition, goal }: MacroChartProps) {
  const macros = [
    { label: 'Protein', current: nutrition.protein, max: goal.protein, color: '#8b5cf6', unit: 'g' },
    { label: 'Carbs', current: nutrition.carbs, max: goal.carbs, color: '#3b82f6', unit: 'g' },
    { label: 'Fat', current: nutrition.fat, max: goal.fat, color: '#f59e0b', unit: 'g' },
    { label: 'Fiber', current: nutrition.fiber, max: goal.fiber, color: '#10b981', unit: 'g' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Macro Breakdown</h3>
      <div className="space-y-3">
        {macros.map((macro) => (
          <MacroBar key={macro.label} {...macro} />
        ))}
      </div>
    </div>
  );
}
