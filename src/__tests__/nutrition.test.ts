// ============================================
// NutriLens - Jest Unit Tests
// 3 tests for nutrition calculation logic
// ============================================

import {
  calculateTotalNutrition,
  calculateGoalPercentage,
  calculateMacroDistribution,
} from '@/lib/nutrition';
import { MealEntry, NutritionData } from '@/types';

describe('Nutrition Calculation Utilities', () => {
  // -----------------------------------------------
  // Test 1: calculateTotalNutrition
  // -----------------------------------------------
  test('calculateTotalNutrition sums up nutrition from multiple meals correctly', () => {
    const meals: MealEntry[] = [
      {
        id: '1',
        dishName: 'Dal Tadka',
        nutrition: { calories: 300, protein: 15, carbs: 40, fat: 8, fiber: 6 },
        healthRisk: { level: 'green', label: 'Healthy', alerts: [], allergens: [], details: '' },
        imageUrl: '',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        dishName: 'Paneer Tikka',
        nutrition: { calories: 450, protein: 28, carbs: 20, fat: 22, fiber: 3 },
        healthRisk: { level: 'yellow', label: 'Moderate', alerts: [], allergens: [], details: '' },
        imageUrl: '',
        timestamp: new Date().toISOString(),
      },
      {
        id: '3',
        dishName: 'Fruit Salad',
        nutrition: { calories: 120, protein: 2, carbs: 30, fat: 0, fiber: 5 },
        healthRisk: { level: 'green', label: 'Healthy', alerts: [], allergens: [], details: '' },
        imageUrl: '',
        timestamp: new Date().toISOString(),
      },
    ];

    const result = calculateTotalNutrition(meals);

    expect(result).toEqual({
      calories: 870,   // 300 + 450 + 120
      protein: 45,     // 15 + 28 + 2
      carbs: 90,       // 40 + 20 + 30
      fat: 30,         // 8 + 22 + 0
      fiber: 14,       // 6 + 3 + 5
    });
  });

  // -----------------------------------------------
  // Test 2: calculateGoalPercentage
  // -----------------------------------------------
  test('calculateGoalPercentage computes correct percentages with clamping', () => {
    // Normal case: 50%
    expect(calculateGoalPercentage(1000, 2000)).toBe(50);

    // Exactly at goal: 100%
    expect(calculateGoalPercentage(2000, 2000)).toBe(100);

    // Over goal: capped at 100%
    expect(calculateGoalPercentage(2500, 2000)).toBe(100);

    // Zero intake: 0%
    expect(calculateGoalPercentage(0, 2000)).toBe(0);

    // Zero goal: should return 0% (edge case)
    expect(calculateGoalPercentage(500, 0)).toBe(0);

    // Negative goal: should return 0%
    expect(calculateGoalPercentage(500, -100)).toBe(0);
  });

  // -----------------------------------------------
  // Test 3: calculateMacroDistribution
  // -----------------------------------------------
  test('calculateMacroDistribution returns correct percentage breakdown', () => {
    const nutrition: NutritionData = {
      calories: 500,
      protein: 30,   // 30 * 4 = 120 cal
      carbs: 50,     // 50 * 4 = 200 cal
      fat: 20,       // 20 * 9 = 180 cal
      fiber: 5,
    };
    // Total macro cals: 120 + 200 + 180 = 500

    const result = calculateMacroDistribution(nutrition);

    expect(result.proteinPct).toBe(24);  // 120/500 = 24%
    expect(result.carbsPct).toBe(40);    // 200/500 = 40%
    expect(result.fatPct).toBe(36);      // 180/500 = 36%

    // Edge case: all zeros
    const zeroNutrition: NutritionData = {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
    };
    const zeroResult = calculateMacroDistribution(zeroNutrition);
    expect(zeroResult).toEqual({ proteinPct: 0, carbsPct: 0, fatPct: 0 });
  });
});
