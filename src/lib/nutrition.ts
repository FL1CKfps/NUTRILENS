// ============================================
// NutriLens - Nutrition Calculation Utilities
// ============================================

import { NutritionData, DailyGoal, DietaryGoal, MealEntry } from '@/types';

/**
 * Default daily goals based on dietary objective
 */
export function getDailyGoal(goal: DietaryGoal): DailyGoal {
  switch (goal) {
    case 'weight_loss':
      return { calories: 1500, protein: 120, carbs: 130, fat: 45, fiber: 30 };
    case 'muscle_gain':
      return { calories: 2800, protein: 180, carbs: 320, fat: 80, fiber: 35 };
    case 'maintain':
    default:
      return { calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 30 };
  }
}

/**
 * Calculate total nutrition from a list of meal entries
 */
export function calculateTotalNutrition(meals: MealEntry[]): NutritionData {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.nutrition.calories,
      protein: acc.protein + meal.nutrition.protein,
      carbs: acc.carbs + meal.nutrition.carbs,
      fat: acc.fat + meal.nutrition.fat,
      fiber: acc.fiber + meal.nutrition.fiber,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

/**
 * Calculate the percentage of daily goal achieved
 * Clamps the value between 0 and 100
 */
export function calculateGoalPercentage(current: number, goal: number): number {
  if (goal <= 0) return 0;
  const percentage = (current / goal) * 100;
  return Math.min(Math.max(Math.round(percentage), 0), 100);
}

/**
 * Calculate macro distribution percentages
 * Returns the percentage of total calories from each macro
 * Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
 */
export function calculateMacroDistribution(nutrition: NutritionData): {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
} {
  const proteinCals = nutrition.protein * 4;
  const carbsCals = nutrition.carbs * 4;
  const fatCals = nutrition.fat * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals;

  if (totalMacroCals === 0) {
    return { proteinPct: 0, carbsPct: 0, fatPct: 0 };
  }

  return {
    proteinPct: Math.round((proteinCals / totalMacroCals) * 100),
    carbsPct: Math.round((carbsCals / totalMacroCals) * 100),
    fatPct: Math.round((fatCals / totalMacroCals) * 100),
  };
}

/**
 * Determine if a meal is healthy based on its nutritional values
 */
export function isMealHealthy(nutrition: NutritionData): boolean {
  // A meal is considered unhealthy if:
  // - Calories exceed 800 per serving
  // - Fat exceeds 35g per serving
  // - Carbs exceed 100g per serving with low protein/fiber ratio
  if (nutrition.calories > 800) return false;
  if (nutrition.fat > 35) return false;
  if (nutrition.carbs > 100 && nutrition.protein < 15 && nutrition.fiber < 5) return false;
  return true;
}

/**
 * Format calorie number with commas
 */
export function formatCalories(calories: number): string {
  return calories.toLocaleString('en-IN');
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
}
