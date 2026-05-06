// ============================================
// NutriLens - Meal Log Card Component
// Individual meal entry in the scrollable list
// ============================================

'use client';

import { MealEntry } from '@/types';
import HealthBadge from './HealthBadge';
import { Trash2, Flame, Beef, Wheat, Droplets } from 'lucide-react';

interface MealCardProps {
  meal: MealEntry;
  onRemove: (id: string) => void;
}

export default function MealCard({ meal, onRemove }: MealCardProps) {
  const timeString = new Date(meal.timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="group rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Food image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white/10">
          {meal.imageUrl ? (
            <img
              src={meal.imageUrl}
              alt={`Photo of ${meal.dishName}, scanned meal`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30">
              <Flame size={24} aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Meal info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-white font-semibold truncate">{meal.dishName}</h4>
              <p className="text-white/40 text-xs mt-0.5">{timeString}</p>
            </div>
            <button
              onClick={() => onRemove(meal.id)}
              className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
              aria-label={`Remove ${meal.dishName} from meal log`}
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>

          {/* Quick macros */}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-amber-400">
              <Flame size={12} aria-hidden="true" />
              {meal.nutrition.calories} kcal
            </span>
            <span className="flex items-center gap-1 text-xs text-violet-400">
              <Beef size={12} aria-hidden="true" />
              {meal.nutrition.protein}g
            </span>
            <span className="flex items-center gap-1 text-xs text-blue-400">
              <Wheat size={12} aria-hidden="true" />
              {meal.nutrition.carbs}g
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <Droplets size={12} aria-hidden="true" />
              {meal.nutrition.fat}g
            </span>
          </div>

          <div className="mt-2">
            <HealthBadge healthRisk={meal.healthRisk} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
