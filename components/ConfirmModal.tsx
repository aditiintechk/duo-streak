'use client';

import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'red' | 'accent';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmColor = 'red',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-(--card-bg) border border-(--border) p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-(--foreground)">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-(--border) transition-colors text-(--text-secondary) hover:text-(--foreground)"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <p className="text-sm text-(--text-secondary) mb-6">{message}</p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--border) transition-all font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-2.5 rounded-lg text-white font-medium transition-all ${
              confirmColor === 'red'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-(--accent) hover:bg-(--accent-dark)'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

