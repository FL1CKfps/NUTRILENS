// ============================================
// NutriLens - Loading Skeleton Components
// Shimmer loading states for async operations
// ============================================

'use client';

export function ScannerSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading food analysis..." role="status">
      <div className="aspect-video rounded-2xl bg-white/10" />
      <div className="space-y-3">
        <div className="h-8 bg-white/10 rounded-xl w-2/3" />
        <div className="h-4 bg-white/10 rounded-lg w-1/2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-white/10 rounded-2xl" />
        ))}
      </div>
      <div className="h-32 bg-white/10 rounded-2xl" />
      <span className="sr-only">Loading food analysis results...</span>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-label="Loading dashboard..." role="status">
      <div className="flex justify-center">
        <div className="w-48 h-48 rounded-full bg-white/10" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 bg-white/10 rounded-lg w-1/3" />
            <div className="h-3 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading dashboard data...</span>
    </div>
  );
}

export function MealPlanSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Generating meal plan..." role="status">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
          <div className="h-6 bg-white/10 rounded-lg w-1/4" />
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-24 bg-white/10 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
      <span className="sr-only">Generating your personalized meal plan...</span>
    </div>
  );
}

export function RestaurantSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Finding restaurants..." role="status">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-20 h-20 rounded-xl bg-white/10 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-white/10 rounded-lg w-2/3" />
            <div className="h-3 bg-white/10 rounded-lg w-1/2" />
            <div className="h-3 bg-white/10 rounded-lg w-1/3" />
          </div>
        </div>
      ))}
      <span className="sr-only">Finding healthy restaurants near you...</span>
    </div>
  );
}
