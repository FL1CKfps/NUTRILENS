// ============================================
// NutriLens - Meal Plan API Route
// POST: Generates a personalized 7-day meal plan
// using Gemini with Indian food options
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { callGeminiWithRetry, cleanJsonResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, allergies, preferences } = body;

    if (!goal) {
      return NextResponse.json({ error: 'Dietary goal is required' }, { status: 400 });
    }

    const goalDescriptions: Record<string, string> = {
      weight_loss: 'Weight Loss (calorie deficit, ~1500 kcal/day, high protein, low carb)',
      muscle_gain: 'Muscle Gain (calorie surplus, ~2800 kcal/day, very high protein)',
      maintain: 'Weight Maintenance (balanced diet, ~2000 kcal/day)',
    };

    const prompt = `You are an expert Indian nutritionist. Create a personalized 7-day meal plan.

Goal: ${goalDescriptions[goal] || 'Balanced diet'}
Allergies to avoid: ${allergies?.length > 0 ? allergies.join(', ') : 'None'}
${preferences ? `Additional preferences: ${preferences}` : ''}

IMPORTANT: Focus on Indian food options (dal, roti, rice, sabzi, idli, dosa, poha, upma, curd, paneer, chicken curry, etc.)

Provide your response in the following exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "mealPlan": [
    {
      "day": "Monday",
      "breakfast": {
        "name": "Masala Oats with Vegetables",
        "description": "Oats cooked with onions, tomatoes, peas, and spices",
        "calories": 280,
        "protein": 12,
        "carbs": 45,
        "fat": 6
      },
      "lunch": {
        "name": "Dal Tadka with Brown Rice",
        "description": "Yellow lentils tempered with cumin and garlic, served with brown rice and salad",
        "calories": 450,
        "protein": 18,
        "carbs": 65,
        "fat": 10
      },
      "snack": {
        "name": "Roasted Chana and Green Tea",
        "description": "A handful of roasted chickpeas with herbal green tea",
        "calories": 150,
        "protein": 8,
        "carbs": 20,
        "fat": 4
      },
      "dinner": {
        "name": "Palak Paneer with Roti",
        "description": "Spinach and cottage cheese curry with 2 whole wheat rotis",
        "calories": 420,
        "protein": 22,
        "carbs": 40,
        "fat": 16
      }
    }
  ]
}

Generate all 7 days (Monday through Sunday). Ensure variety across days. Keep nutritional values realistic.`;

    const result = await callGeminiWithRetry([prompt]);
    const responseText = result.response.text();
    const cleanedResponse = cleanJsonResponse(responseText);
    const mealPlanData = JSON.parse(cleanedResponse);

    return NextResponse.json(mealPlanData);
  } catch (error) {
    console.error('Meal plan API error:', error);
    const isRateLimit = error instanceof Error && (error.message.includes('429') || error.message.includes('503'));
    const retryAfterSeconds = (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds;
    return NextResponse.json(
      {
        error: isRateLimit
          ? 'AI service is busy right now. Please wait a moment and try again.'
          : 'Failed to generate meal plan. Please try again.',
        retryAfterSeconds: isRateLimit ? retryAfterSeconds : undefined,
        provider: isRateLimit ? 'gemini' : undefined,
      },
      {
        status: isRateLimit ? 429 : 500,
        headers: retryAfterSeconds ? { 'Retry-After': String(retryAfterSeconds) } : undefined,
      }
    );
  }
}
