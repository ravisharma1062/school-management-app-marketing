import type { ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/60 bg-white/80 shadow-card backdrop-blur-sm transition-shadow duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
