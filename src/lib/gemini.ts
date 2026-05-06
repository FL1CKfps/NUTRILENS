// ============================================
// NutriLens - Gemini API Helper
// Shared retry logic with exponential backoff
// for handling 429/503 transient errors
// ============================================

import { GoogleGenerativeAI, GenerativeModel, GenerateContentResult } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Model fallback chain: try primary, then fall back
const MODEL_CHAIN = (process.env.GEMINI_MODEL_CHAIN || '')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

const DEFAULT_MODEL_CHAIN = ['gemini-2.5-flash-lite'];

const MODEL_COOLDOWN_MS_NOT_FOUND = 6 * 60 * 60 * 1000;
const MODEL_COOLDOWN_MS_RATE_LIMIT = 30 * 1000;
const modelCooldowns = new Map<string, number>();

function getModelChain(): string[] {
  return MODEL_CHAIN.length ? MODEL_CHAIN : DEFAULT_MODEL_CHAIN;
}

function getRetryAfterSeconds(errMsg: string): number | null {
  const retryDelayMatch = errMsg.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
  if (retryDelayMatch) {
    return Number(retryDelayMatch[1]);
  }

  const retryInMatch = errMsg.match(/retry\s+(?:in\s+)?(\d+(?:\.\d+)?)s/iu);
  if (retryInMatch) {
    return Math.ceil(Number(retryInMatch[1]));
  }

  return null;
}

function setCooldown(modelName: string, ms: number) {
  modelCooldowns.set(modelName, Date.now() + ms);
}

function isCoolingDown(modelName: string): boolean {
  const until = modelCooldowns.get(modelName);
  return typeof until === 'number' && until > Date.now();
}

export function getModel(modelName?: string): GenerativeModel {
  const chain = getModelChain();
  return genAI.getGenerativeModel({ model: modelName || chain[0] });
}

/**
 * Call Gemini with automatic retry + model fallback.
 * Retries up to 3 times with exponential backoff on 429/503.
 * Falls back to alternate models if the primary is unavailable (404).
 */
export async function callGeminiWithRetry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contentParts: any[],
  maxRetries = 3
): Promise<GenerateContentResult> {
  let lastError: Error | null = null;

  const chain = getModelChain();
  const availableChain = chain.filter((modelName) => !isCoolingDown(modelName));

  if (!availableChain.length) {
    const retryAfterMs = Math.min(
      ...chain
        .map((name) => modelCooldowns.get(name))
        .filter((until): until is number => typeof until === 'number')
        .map((until) => Math.max(until - Date.now(), 0))
    );
    const retryAfterSeconds = Math.max(Math.ceil(retryAfterMs / 1000), 1);
    const cooldownError = new Error('All Gemini models are cooling down. Please retry soon.');
    (cooldownError as Error & { retryAfterSeconds?: number }).retryAfterSeconds = retryAfterSeconds;
    throw cooldownError;
  }

  for (const modelName of availableChain) {
    const model = getModel(modelName);

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await model.generateContent(contentParts);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const errMsg = lastError.message;
        const retryAfterSeconds = getRetryAfterSeconds(errMsg);

        // 404 = model not found → skip to next model in chain
        if (errMsg.includes('404') || errMsg.includes('not found')) {
          console.warn(`Model ${modelName} not available, trying next...`);
          setCooldown(modelName, MODEL_COOLDOWN_MS_NOT_FOUND);
          break; // break retry loop, try next model
        }

        // 429/503 = rate limit / overloaded → retry with backoff
        if (errMsg.includes('429') || errMsg.includes('503') || errMsg.includes('Too Many Requests') || errMsg.includes('Service Unavailable')) {
          const baseDelayMs = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          const retryDelayMs = retryAfterSeconds ? retryAfterSeconds * 1000 : baseDelayMs;
          const delay = Math.max(baseDelayMs, retryDelayMs);
          console.warn(`Gemini ${modelName} rate limited (attempt ${attempt + 1}/${maxRetries}), retrying in ${Math.round(delay)}ms...`);
          await new Promise((r) => setTimeout(r, delay));

          if (attempt === maxRetries - 1) {
            setCooldown(modelName, Math.max(delay, MODEL_COOLDOWN_MS_RATE_LIMIT));
            break;
          }

          continue;
        }

        // Other errors: don't retry
        throw lastError;
      }
    }
  }

  if (lastError) {
    const errMsg = lastError.message;
    const retryAfterSeconds = getRetryAfterSeconds(errMsg);
    (lastError as Error & { retryAfterSeconds?: number }).retryAfterSeconds = retryAfterSeconds || undefined;
  }

  throw lastError || new Error('All Gemini models failed');
}

/**
 * Clean a Gemini response that might be wrapped in markdown code fences.
 */
export function cleanJsonResponse(text: string): string {
  let cleaned = text;
  if (cleaned.includes('```json')) {
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  }
  if (cleaned.includes('```')) {
    cleaned = cleaned.replace(/```\n?/g, '');
  }
  return cleaned.trim();
}
