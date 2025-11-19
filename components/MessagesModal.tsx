'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { useMessages, Message } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MessagesModal({ isOpen, onClose }: MessagesModalProps) {
  const { messages, unreadCount, markAsRead, sendMessage, fetchMessages } = useMessages();
  const { user } = useAuth();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen, fetchMessages]);

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.read) {
      await markAsRead(message.id);
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('messagesUpdated'));
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedMessage) return;

    setSendingReply(true);
    try {
      const success = await sendMessage(
        replyContent.trim(),
        selectedMessage.relatedHabitId || undefined,
        selectedMessage.relatedTodoId || undefined,
        selectedMessage.id
      );
      if (success) {
        setReplyContent('');
        setSelectedMessage(null);
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('messagesUpdated'));
      } else {
        alert('Failed to send reply');
      }
    } catch (error) {
      alert('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  if (!isOpen) return null;

  // Show message list or detail view
  if (selectedMessage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-2xl rounded-xl bg-(--card-bg) border border-(--border) max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-(--border)">
            <button
              onClick={() => {
                setSelectedMessage(null);
                setReplyContent('');
              }}
              className="text-sm text-(--accent) hover:underline"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold text-(--foreground) flex items-center gap-2">
              Message
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-(--border) transition-colors"
            >
              <X className="h-5 w-5 text-(--foreground)" />
            </button>
          </div>

          {/* Message Detail */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-(--foreground)">
                  {selectedMessage.senderName}
                </p>
                <p className="text-xs text-(--text-secondary)">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>
              {(selectedMessage.relatedHabitTitle || selectedMessage.relatedTodoText) && (
                <div className="mb-2 p-2 rounded-lg bg-(--accent)/10 border border-(--accent)/20">
                  <p className="text-xs text-(--text-secondary) mb-0.5">About:</p>
                  <p className="text-sm font-medium text-(--foreground)">
                    {selectedMessage.relatedHabitTitle || selectedMessage.relatedTodoText}
                  </p>
                </div>
              )}
              {selectedMessage.parentMessageContent && (
                <div className="mb-2 p-2 rounded-lg bg-(--border) border border-(--border)">
                  <p className="text-xs text-(--text-secondary) mb-0.5">In reply to:</p>
                  <p className="text-sm text-(--foreground)">
                    {selectedMessage.parentMessageContent}
                  </p>
                </div>
              )}
              <div className="p-3 rounded-lg bg-(--background) border border-(--border)">
                <p className="text-sm text-(--foreground) whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>
            </div>
          </div>

          {/* Reply Form */}
          <div className="border-t border-(--border) p-4">
            <form onSubmit={handleReply} className="space-y-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent) text-sm min-h-[80px]"
                placeholder="Type your reply..."
                required
              />
              <button
                type="submit"
                disabled={sendingReply || !replyContent.trim()}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-(--accent) text-white font-medium hover:bg-(--accent-dark) transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {sendingReply ? 'Sending...' : 'Send Reply'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show messages list
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-(--card-bg) border border-(--border) max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-(--border)">
          <h2 className="text-xl font-bold text-(--foreground) flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-(--accent) text-white text-xs px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-(--border) transition-colors"
          >
            <X className="h-5 w-5 text-(--foreground)" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-sm text-(--text-secondary)">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet</p>
            </div>
          ) : (
            <div className="divide-y divide-(--border)">
              {messages.map((message) => (
                <button
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className={`w-full p-4 text-left hover:bg-(--border)/50 transition-colors ${
                    !message.read ? 'bg-(--accent)/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-(--foreground)">
                      {message.senderName}
                    </p>
                    {!message.read && (
                      <div className="h-2 w-2 rounded-full bg-(--accent) shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-(--text-secondary) line-clamp-2 mb-1">
                    {message.content}
                  </p>
                  {(message.relatedHabitTitle || message.relatedTodoText) && (
                    <p className="text-xs text-(--accent) mt-1">
                      Re: {message.relatedHabitTitle || message.relatedTodoText}
                    </p>
                  )}
                  <p className="text-xs text-(--text-secondary) mt-1">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

