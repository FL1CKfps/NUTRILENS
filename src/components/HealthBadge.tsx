// ============================================
// NutriLens - Health Badge Component
// Color-coded risk indicator for food analysis
// ============================================

'use client';

import { HealthRisk, RiskLevel } from '@/types';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface HealthBadgeProps {
  healthRisk: HealthRisk;
  compact?: boolean;
}

const riskConfig: Record<RiskLevel, { bg: string; border: string; text: string; icon: typeof ShieldCheck; glowColor: string }> = {
  green: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    icon: ShieldCheck,
    glowColor: 'shadow-emerald-500/20',
  },
  yellow: {
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: AlertTriangle,
    glowColor: 'shadow-amber-500/20',
  },
  red: {
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: ShieldAlert,
    glowColor: 'shadow-red-500/20',
  },
};

export default function HealthBadge({ healthRisk, compact = false }: HealthBadgeProps) {
  const config = riskConfig[healthRisk.level];
  const Icon = config.icon;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.border} ${config.text}`}
        aria-label={`Health risk level: ${healthRisk.label}`}
      >
        <Icon size={12} aria-hidden="true" />
        {healthRisk.label}
      </span>
    );
  }

  return (
    <div
      className={`rounded-2xl border p-4 ${config.bg} ${config.border} shadow-lg ${config.glowColor}`}
      role="alert"
      aria-label={`Health risk assessment: ${healthRisk.label}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl ${config.bg} ${config.text}`}>
          <Icon size={24} aria-hidden="true" />
        </div>
        <div>
          <h4 className={`font-bold text-lg ${config.text}`}>{healthRisk.label}</h4>
          <p className="text-white/50 text-sm">Health Risk Assessment</p>
        </div>
      </div>

      <p className="text-white/70 text-sm mb-3">{healthRisk.details}</p>

      {healthRisk.alerts.length > 0 && (
        <div className="mb-3">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5">Alerts</p>
          <ul className="space-y-1">
            {healthRisk.alerts.map((alert, i) => (
              <li key={i} className="text-white/70 text-sm flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text-', 'bg-')}`} aria-hidden="true" />
                {alert}
              </li>
            ))}
          </ul>
        </div>
      )}

      {healthRisk.allergens.length > 0 && (
        <div>
          <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1.5">Allergens Detected</p>
          <div className="flex flex-wrap gap-1.5">
            {healthRisk.allergens.map((allergen, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-300 border border-red-500/20"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
