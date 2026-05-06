// ============================================
// NutriLens - Client-side State Store
// Uses localStorage for persistence
// ============================================

import { MealEntry, DietaryGoal, DailyGoal } from '@/types';
import { getDailyGoal } from './nutrition';

const MEALS_KEY = 'nutrilens_meals';
const GOAL_KEY = 'nutrilens_goal';

function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function getTodaysMeals(): MealEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(MEALS_KEY);
    if (!stored) return [];
    const allMeals: MealEntry[] = JSON.parse(stored);
    return allMeals.filter((meal) => isToday(meal.timestamp));
  } catch {
    return [];
  }
}

export function addMeal(meal: MealEntry): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(MEALS_KEY);
    const allMeals: MealEntry[] = stored ? JSON.parse(stored) : [];
    allMeals.push(meal);
    localStorage.setItem(MEALS_KEY, JSON.stringify(allMeals));
  } catch {
    console.error('Failed to save meal');
  }
}

export function removeMeal(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(MEALS_KEY);
    if (!stored) return;
    const allMeals: MealEntry[] = JSON.parse(stored);
    const filtered = allMeals.filter((m) => m.id !== id);
    localStorage.setItem(MEALS_KEY, JSON.stringify(filtered));
  } catch {
    console.error('Failed to remove meal');
  }
}

export function getDietaryGoal(): DietaryGoal {
  if (typeof window === 'undefined') return 'maintain';
  try {
    const stored = localStorage.getItem(GOAL_KEY);
    if (stored) return stored as DietaryGoal;
    return 'maintain';
  } catch {
    return 'maintain';
  }
}

export function setDietaryGoal(goal: DietaryGoal): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GOAL_KEY, goal);
}

export function getCurrentDailyGoal(): DailyGoal {
  return getDailyGoal(getDietaryGoal());
}
