// ============================================
// NutriLens - Type Definitions
// ============================================

export interface NutritionData {
  calories: number;
  protein: number;    // grams
  carbs: number;      // grams
  fat: number;        // grams
  fiber: number;      // grams
}

export interface FoodScanResult {
  dishName: string;
  confidence: number;
  nutrition: NutritionData;
  healthRisk: HealthRisk;
  imageUrl: string;
  timestamp: string;
}

export type RiskLevel = 'green' | 'yellow' | 'red';

export interface HealthRisk {
  level: RiskLevel;
  label: string;
  alerts: string[];
  allergens: string[];
  details: string;
}

export interface MealEntry {
  id: string;
  dishName: string;
  nutrition: NutritionData;
  healthRisk: HealthRisk;
  imageUrl: string;
  timestamp: string;
}

export interface DailyGoal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export type DietaryGoal = 'weight_loss' | 'muscle_gain' | 'maintain';

export interface MealPlanRequest {
  goal: DietaryGoal;
  allergies: string[];
  preferences?: string;
}

export interface DayMealPlan {
  day: string;
  breakfast: MealItem;
  lunch: MealItem;
  snack: MealItem;
  dinner: MealItem;
}

export interface MealItem {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Restaurant {
  name: string;
  rating: number;
  address: string;
  distance: string;
  placeId: string;
  location: {
    lat: number;
    lng: number;
  };
  photoUrl?: string;
  isOpen?: boolean;
  totalRatings?: number;
}
