'use client';

import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface TodoItemProps {
  id: string;
  text: string;
  completed: boolean;
  assignedTo: 'me' | 'partner' | 'both';
  onToggle: () => void;
  onDelete?: () => void;
}

export default function TodoItem({ text, completed, assignedTo, onToggle, onDelete }: TodoItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const assignedColors = {
    me: 'border-l-(--accent)',
    partner: 'border-l-(--partner-color)',
    both: 'border-l-(--accent) border-l-4',
  };

  const tagLabels = {
    me: 'Mine',
    partner: "Partner's",
    both: 'Together',
  };

  const tagColors = {
    me: 'bg-(--accent)/10 text-(--accent) border-(--accent)/20',
    partner: 'bg-(--partner-color)/10 text-(--partner-color) border-(--partner-color)/20',
    both: 'bg-gradient-to-r from-(--accent)/10 to-(--partner-color)/10 text-(--foreground) border-(--accent)/20',
  };

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-lg border-l-4 bg-(--card-bg) p-3 transition-all hover:shadow-md hover:scale-[1.01] ${assignedColors[assignedTo]} ${
        completed ? 'opacity-60' : ''
      }`}
    >
      <button
        onClick={onToggle}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
          completed
            ? 'border-(--success) bg-(--success) text-white'
            : 'border-(--border) hover:border-(--accent)'
        }`}
      >
        {completed && <Check className="h-3 w-3" />}
      </button>
      <div className="flex-1 flex items-center justify-between gap-2">
        <p
          className={`text-sm font-medium ${
            completed ? 'line-through text-(--text-secondary)' : 'text-(--foreground)'
          }`}
        >
          {text}
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium border ${tagColors[assignedTo]}`}
          >
            {tagLabels[assignedTo]}
          </span>
          {onDelete && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteModal(true);
                }}
                className="opacity-60 hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-600"
                aria-label="Delete todo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => {
                  onDelete();
                }}
                title="Delete Todo"
                message={`Are you sure you want to delete "${text}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                confirmColor="red"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

