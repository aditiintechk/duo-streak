'use client';

import { Check } from 'lucide-react';

interface TodoItemProps {
  id: string;
  text: string;
  completed: boolean;
  assignedTo: 'me' | 'partner' | 'both';
  onToggle: () => void;
}

export default function TodoItem({ text, completed, assignedTo, onToggle }: TodoItemProps) {
  const assignedColors = {
    me: 'border-l-[var(--accent)]',
    partner: 'border-l-[var(--partner-color)]',
    both: 'border-l-[var(--accent)] border-l-4',
  };

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg border-l-4 bg-[var(--card-bg)] p-3 transition-all hover:shadow-md hover:scale-[1.01] ${assignedColors[assignedTo]} ${
        completed ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={onToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
          completed
            ? 'border-[var(--success)] bg-[var(--success)] text-white'
            : 'border-[var(--border)] hover:border-[var(--accent)]'
        }`}
      >
        {completed && <Check className="h-3 w-3" />}
      </button>
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            completed ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--foreground)]'
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

