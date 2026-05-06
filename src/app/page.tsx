// ============================================
// NutriLens - Dashboard Page (Home)
// Calorie progress ring, macro chart, meal log
// ============================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import ProgressRing from '@/components/ProgressRing';
import MacroChart from '@/components/MacroChart';
import MealCard from '@/components/MealCard';
import { DashboardSkeleton } from '@/components/Skeletons';
import { getTodaysMeals, removeMeal, getCurrentDailyGoal } from '@/lib/store';
import { calculateTotalNutrition, calculateGoalPercentage } from '@/lib/nutrition';
import { MealEntry, DailyGoal, NutritionData } from '@/types';
import { Flame, TrendingUp, Utensils, Leaf } from 'lucide-react';

export default function DashboardPage() {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [totals, setTotals] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    const todaysMeals = getTodaysMeals();
    const goal = getCurrentDailyGoal();
    const total = calculateTotalNutrition(todaysMeals);
    setMeals(todaysMeals);
    setDailyGoal(goal);
    setTotals(total);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();

    // Listen for storage events from other tabs/windows
    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    
    // Also listen for custom events from within the same tab
    window.addEventListener('nutrilens-meal-added', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('nutrilens-meal-added', handleStorage);
    };
  }, [loadData]);

  const handleRemoveMeal = (id: string) => {
    removeMeal(id);
    loadData();
  };

  if (loading || !dailyGoal) {
    return (
      <div className="max-w-lg mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  const caloriePercentage = calculateGoalPercentage(totals.calories, dailyGoal.calories);

  const quickStats = [
    {
      label: 'Calories',
      value: totals.calories,
      unit: 'kcal',
      icon: Flame,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Protein',
      value: totals.protein,
      unit: 'g',
      icon: TrendingUp,
      color: 'text-violet-400',
      bg: 'bg-violet-400/10',
    },
    {
      label: 'Meals',
      value: meals.length,
      unit: 'today',
      icon: Utensils,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Fiber',
      value: totals.fiber,
      unit: 'g',
      icon: Leaf,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-white">
          Today&apos;s Dashboard
        </h1>
        <p className="text-white/50 text-sm">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* Calorie Progress Ring */}
      <div className="glass-card-elevated p-6">
        <div className="relative flex justify-center">
          <ProgressRing
            percentage={caloriePercentage}
            current={totals.calories}
            goal={dailyGoal.calories}
            label="Daily calorie progress"
            size={200}
          />
        </div>
        <p className="text-center text-white/40 text-sm mt-4">
          {caloriePercentage < 100
            ? `${dailyGoal.calories - totals.calories} kcal remaining`
            : `${totals.calories - dailyGoal.calories} kcal over limit`}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <Icon size={14} className={stat.color} aria-hidden="true" />
                </div>
                <span className="text-white/50 text-xs font-medium">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-white">
                {stat.value}
                <span className="text-sm text-white/40 font-normal ml-1">{stat.unit}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Macro Breakdown */}
      <div className="glass-card p-5">
        <MacroChart nutrition={totals} goal={dailyGoal} />
      </div>

      {/* Meal Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Today&apos;s Meals</h2>
          <span className="text-white/40 text-sm">{meals.length} logged</span>
        </div>

        {meals.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
              <Utensils size={28} className="text-emerald-400" aria-hidden="true" />
            </div>
            <p className="text-white/60 font-medium">No meals logged yet</p>
            <p className="text-white/30 text-sm mt-1">
              Scan a food item to start tracking
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1" role="list" aria-label="Today's meal log">
            {meals.map((meal) => (
              <div key={meal.id} role="listitem">
                <MealCard meal={meal} onRemove={handleRemoveMeal} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
