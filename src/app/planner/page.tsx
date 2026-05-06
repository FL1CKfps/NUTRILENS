'use client';

import { useState } from 'react';
import { MealPlanSkeleton } from '@/components/Skeletons';
import { DietaryGoal, DayMealPlan } from '@/types';
import { setDietaryGoal } from '@/lib/store';
import { UtensilsCrossed, ChevronDown, ChevronUp, Flame, Beef, Wheat, Droplets, Sparkles, X } from 'lucide-react';

const ALLERGY_OPTIONS = ['Gluten','Dairy','Nuts','Soy','Eggs','Shellfish','Fish','Sesame'];

const GOAL_OPTIONS: { value: DietaryGoal; label: string; desc: string; emoji: string }[] = [
  { value: 'weight_loss', label: 'Weight Loss', desc: '~1500 kcal/day', emoji: '🔥' },
  { value: 'muscle_gain', label: 'Muscle Gain', desc: '~2800 kcal/day', emoji: '💪' },
  { value: 'maintain', label: 'Maintain', desc: '~2000 kcal/day', emoji: '⚖️' },
];

export default function PlannerPage() {
  const [goal, setGoal] = useState<DietaryGoal>('maintain');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [mealPlan, setMealPlan] = useState<DayMealPlan[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<number>(0);

  const toggleAllergy = (a: string) => {
    setAllergies((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a]);
  };

  const generatePlan = async () => {
    setIsLoading(true); setError(null); setMealPlan(null); setRetryAfterSeconds(null);
    setDietaryGoal(goal);
    try {
      const res = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, allergies }),
      });
      if (!res.ok) {
        const e = await res.json();
        const isBusy = res.status === 429 || res.status === 503;
        const message = isBusy
          ? 'Gemini is experiencing high usage right now. The request was rate-limited by the AI provider. Please try again in a moment.'
          : (e.error || 'Failed');
        if (typeof e.retryAfterSeconds === 'number') {
          setRetryAfterSeconds(Math.max(e.retryAfterSeconds, 1));
        }
        throw new Error(message);
      }
      const data = await res.json();
      setMealPlan(data.mealPlan);
      setExpandedDay(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium mb-2">
          <Sparkles size={14} aria-hidden="true" />AI Meal Planner
        </div>
        <h1 className="text-2xl font-bold text-white">Smart Meal Planner</h1>
        <p className="text-white/50 text-sm">Get a personalized 7-day plan with Indian food options</p>
      </div>

      <div className="glass-card-elevated p-5 space-y-4">
        <h2 className="text-base font-semibold text-white">Your Goal</h2>
        <div className="grid grid-cols-3 gap-2">
          {GOAL_OPTIONS.map((o) => (
            <button key={o.value} onClick={() => setGoal(o.value)}
              className={`p-3 rounded-xl text-center transition-all duration-200 border ${goal === o.value ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
              aria-label={`Set goal to ${o.label}`} aria-pressed={goal === o.value}>
              <span className="text-2xl block mb-1" aria-hidden="true">{o.emoji}</span>
              <span className="text-xs font-semibold block">{o.label}</span>
              <span className="text-[10px] text-white/40 block mt-0.5">{o.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 space-y-3">
        <h2 className="text-base font-semibold text-white">Allergies &amp; Restrictions</h2>
        <div className="flex flex-wrap gap-2">
          {ALLERGY_OPTIONS.map((a) => {
            const sel = allergies.includes(a);
            return (
              <button key={a} onClick={() => toggleAllergy(a)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${sel ? 'bg-red-500/15 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'}`}
                aria-label={`${sel ? 'Remove' : 'Add'} ${a} allergy`} aria-pressed={sel}>
                {sel && <X size={10} className="inline mr-1" aria-hidden="true" />}{a}
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={generatePlan} disabled={isLoading}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-400 hover:to-fuchsia-400 text-white font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
        aria-label="Generate personalized 7-day meal plan">
        {isLoading ? (<><div className="spinner w-5 h-5 border-2 border-white/30 border-t-white" />Generating...</>) : (<><Sparkles size={18} aria-hidden="true" />Generate 7-Day Plan</>)}
      </button>

      {isLoading && <MealPlanSkeleton />}
      {error && (
        <div className="glass-card p-5 border-red-500/20" role="alert">
          <p className="text-red-400 font-medium">Failed to generate plan</p>
          <p className="text-red-300/60 text-sm mt-1">{error}</p>
          {retryAfterSeconds !== null && (
            <p className="text-red-300/60 text-xs mt-2">Try again in ~{retryAfterSeconds}s.</p>
          )}
        </div>
      )}

      {mealPlan && !isLoading && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Your 7-Day Meal Plan</h2>
          {mealPlan.map((day, i) => (
            <DayCard key={day.day} day={day} isExpanded={expandedDay === i} onToggle={() => setExpandedDay(expandedDay === i ? -1 : i)} />
          ))}
        </div>
      )}
    </div>
  );
}

function DayCard({ day, isExpanded, onToggle }: { day: DayMealPlan; isExpanded: boolean; onToggle: () => void }) {
  const total = day.breakfast.calories + day.lunch.calories + day.snack.calories + day.dinner.calories;
  const meals = [
    { label: '🌅 Breakfast', meal: day.breakfast },
    { label: '☀️ Lunch', meal: day.lunch },
    { label: '🍿 Snack', meal: day.snack },
    { label: '🌙 Dinner', meal: day.dinner },
  ];

  return (
    <div className="glass-card overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
        aria-expanded={isExpanded} aria-label={`${day.day} - ${total} kcal total`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
            <UtensilsCrossed size={18} className="text-violet-400" aria-hidden="true" />
          </div>
          <div><h3 className="text-white font-semibold">{day.day}</h3><p className="text-white/40 text-xs">{total} kcal</p></div>
        </div>
        {isExpanded ? <ChevronUp size={18} className="text-white/40" /> : <ChevronDown size={18} className="text-white/40" />}
      </button>
      {isExpanded && (
        <div className="border-t border-white/10 p-4 space-y-3">
          {meals.map(({ label, meal }) => (
            <div key={label} className="rounded-xl bg-white/5 p-3.5">
              <p className="text-xs text-white/40 font-medium mb-1">{label}</p>
              <h4 className="text-white font-semibold text-sm">{meal.name}</h4>
              <p className="text-white/40 text-xs mt-1">{meal.description}</p>
              <div className="flex items-center gap-3 mt-2.5">
                <span className="flex items-center gap-1 text-[10px] text-amber-400"><Flame size={10} aria-hidden="true" />{meal.calories}kcal</span>
                <span className="flex items-center gap-1 text-[10px] text-violet-400"><Beef size={10} aria-hidden="true" />{meal.protein}g</span>
                <span className="flex items-center gap-1 text-[10px] text-blue-400"><Wheat size={10} aria-hidden="true" />{meal.carbs}g</span>
                <span className="flex items-center gap-1 text-[10px] text-orange-400"><Droplets size={10} aria-hidden="true" />{meal.fat}g</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
