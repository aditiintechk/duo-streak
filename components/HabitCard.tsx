'use client';

import { Check, Flame } from 'lucide-react';

interface HabitCardProps {
  title: string;
  streak: number;
  completed: boolean;
  owner: 'me' | 'partner' | 'shared';
  onToggle: () => void;
}

export default function HabitCard({ title, streak, completed, owner, onToggle }: HabitCardProps) {
  const ownerColors = {
    me: 'bg-[var(--accent)]/10 border-[var(--accent)]/20',
    partner: 'bg-[var(--partner-color)]/10 border-[var(--partner-color)]/20',
    shared: 'bg-gradient-to-br from-[var(--accent)]/10 to-[var(--partner-color)]/10 border-[var(--accent)]/20',
  };

  const ownerLabels = {
    me: 'You',
    partner: 'Partner',
    shared: 'Shared',
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border-2 p-3 transition-all hover:shadow-lg hover:scale-[1.01] ${ownerColors[owner]} ${
        completed ? 'opacity-90' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {ownerLabels[owner]}
            </span>
            {streak > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--accent)]/20 px-1.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                <Flame className="h-3 w-3" />
                {streak} day{streak !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
        </div>
        <button
          onClick={onToggle}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
            completed
              ? 'border-[var(--success)] bg-[var(--success)] text-white'
              : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10'
          }`}
        >
          {completed && <Check className="h-4 w-4" />}
        </button>
      </div>
      
      {/* Progress ring visualization */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all"
            style={{ width: completed ? '100%' : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}

