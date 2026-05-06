// ============================================
// NutriLens - Food Scan API Route
// POST: Accepts a food image and uses Gemini Vision for
// identification + nutrition + health risk
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { callGeminiWithRetry, cleanJsonResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const imageBytes = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBytes).toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';

    // Use Gemini Vision for identification + nutrition analysis + health risk
    const prompt = `You are a professional nutritionist AI. Analyze this food image.

Please identify this dish based on the image.

Provide your response in the following exact JSON format (no markdown, no code blocks, just raw JSON):
{
  "dishName": "Name of the dish",
  "confidence": 0.85,
  "nutrition": {
    "calories": 350,
    "protein": 25,
    "carbs": 40,
    "fat": 12,
    "fiber": 5
  },
  "healthRisk": {
    "level": "green",
    "label": "Healthy Choice",
    "alerts": ["Contains moderate sodium"],
    "allergens": ["gluten", "dairy"],
    "details": "This dish is a balanced meal with good protein content."
  }
}

Rules for healthRisk.level:
- "green": Healthy, balanced, whole food ingredients
- "yellow": Moderate concern - somewhat processed, moderate sodium/sugar
- "red": High concern - ultra-processed, high sodium, high sugar, or contains common allergens

Be accurate with nutritional estimates. Consider typical serving sizes.`;

    const result = await callGeminiWithRetry([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ]);

    const responseText = result.response.text();
    const cleanedResponse = cleanJsonResponse(responseText);
    const analysisResult = JSON.parse(cleanedResponse);

    return NextResponse.json({
      ...analysisResult,
      imageUrl: `data:${mimeType};base64,${base64Image}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scan API error:', error);
    const isRateLimit = error instanceof Error && (error.message.includes('429') || error.message.includes('503'));
    const retryAfterSeconds = (error as Error & { retryAfterSeconds?: number }).retryAfterSeconds;
    return NextResponse.json(
      {
        error: isRateLimit
          ? 'AI service is busy right now. Please wait a moment and try again.'
          : 'Failed to analyze food image. Please try again.',
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
