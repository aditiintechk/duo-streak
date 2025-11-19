'use client';

import { useState } from 'react';
import { Check, Flame, MessageSquare, Trash2, Edit } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface HabitCardProps {
  title: string;
  streak: number;
  completed: boolean;
  owner: 'me' | 'partner' | 'shared';
  onToggle: () => void;
  onMessage?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  sharedCompletion?: {
    user: boolean;
    partner: boolean;
  };
}

export default function HabitCard({ title, streak, completed, owner, onToggle, onMessage, onEdit, onDelete, sharedCompletion }: HabitCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const ownerColors = {
    me: 'bg-(--accent)/10 border-(--accent)/20',
    partner: 'bg-(--partner-color)/10 border-(--partner-color)/20',
    shared: 'bg-gradient-to-br from-(--accent)/10 to-(--partner-color)/10 border-(--accent)/20',
  };

  const ownerLabels = {
    me: 'You',
    partner: 'Partner',
    shared: 'Together',
  };

  const isPartnerHabit = owner === 'partner';
  const isSharedHabit = owner === 'shared';
  const partnerCompleted = sharedCompletion?.partner ?? false;
  const userCompleted = sharedCompletion?.user ?? completed;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border-2 p-3 transition-all hover:shadow-lg hover:scale-[1.01] ${ownerColors[owner]} ${
        (isSharedHabit && sharedCompletion && userCompleted && partnerCompleted) || (!isSharedHabit && userCompleted) ? 'opacity-90' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          {streak > 0 && (
            <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-(--accent)/20 px-1.5 py-0.5 text-xs font-semibold text-(--accent)">
              <Flame className="h-3 w-3" />
              {streak} day{streak !== 1 ? 's' : ''}
            </span>
          )}
          <h3 className="text-sm font-semibold text-(--foreground) break-words">{title}</h3>
          {isSharedHabit && sharedCompletion && (
            <div className="mt-2 flex items-center gap-3 text-xs text-(--text-secondary)">
              <div className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${userCompleted ? 'bg-(--accent)' : 'bg-(--border)'}`} />
                <span>You</span>
              </div>
              <div className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${partnerCompleted ? 'bg-(--partner-color)' : 'bg-(--border)'}`} />
                <span>Partner</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Show message button for partner habits or shared habits when partner hasn't completed */}
          {isPartnerHabit ? (
            !completed && onMessage ? (
              <button
                onClick={onMessage}
                className="flex items-center gap-1.5 rounded-lg bg-(--partner-color) px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-(--partner-color)/80 hover:shadow-md"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Message
              </button>
            ) : completed ? (
              <div className="flex items-center gap-1.5 rounded-lg bg-(--success)/10 px-3 py-1.5 text-xs font-medium text-(--success)">
                <Check className="h-3.5 w-3.5" />
                Done
              </div>
            ) : null
          ) : isSharedHabit && sharedCompletion && userCompleted && !partnerCompleted && onMessage ? (
            <button
              onClick={onMessage}
              className="flex items-center gap-1.5 rounded-lg bg-(--partner-color) px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-(--partner-color)/80 hover:shadow-md"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Message
            </button>
          ) : (
            <>
              <button
                onClick={onToggle}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all shadow-sm ${
                  userCompleted
                    ? 'border-(--success) bg-(--success) text-white shadow-md'
                    : 'border-(--accent) bg-(--card-bg) hover:border-(--accent-dark) hover:bg-(--accent)/20 hover:shadow-md'
                }`}
              >
                {userCompleted && <Check className="h-3.5 w-3.5" />}
              </button>
              {/* Edit button */}
              {onEdit && !isPartnerHabit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="opacity-60 hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-(--accent)/10 text-(--accent) hover:text-(--accent-dark)"
                  aria-label="Edit habit"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
              {/* Delete button - only show for non-partner habits */}
              {onDelete && !isPartnerHabit && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(true);
                    }}
                    className="opacity-60 hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-600"
                    aria-label="Delete habit"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ConfirmModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={() => {
                      onDelete();
                    }}
                    title="Delete Habit"
                    message={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    confirmColor="red"
                  />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

