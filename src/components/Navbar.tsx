// ============================================
// NutriLens - Navigation Bar Component
// Mobile-first bottom navigation with active states
// ============================================

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Camera, LayoutDashboard, UtensilsCrossed, MapPin } from 'lucide-react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/scanner', icon: Camera, label: 'Scan' },
  { href: '/planner', icon: UtensilsCrossed, label: 'Planner' },
  { href: '/restaurants', icon: MapPin, label: 'Nearby' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" aria-label="NutriLens Home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
              <Camera size={18} className="text-[#0a0a0f]" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              NutriLens
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-emerald-400'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-t border-white/10 pb-safe" aria-label="Main navigation">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px] ${
                  isActive
                    ? 'text-emerald-400'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-emerald-400/15' : ''}`}>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
