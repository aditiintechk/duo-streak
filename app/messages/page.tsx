'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, MessageSquare, Send } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useMessages, Message } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { messages, unreadCount, markAsRead, sendMessage, fetchMessages } = useMessages();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Listen for message updates and refetch
  useEffect(() => {
    const handleMessagesUpdated = () => {
      fetchMessages();
    };
    window.addEventListener('messagesUpdated', handleMessagesUpdated);
    return () => {
      window.removeEventListener('messagesUpdated', handleMessagesUpdated);
    };
  }, [fetchMessages]);

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

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-(--background) pb-16 sm:pb-0 sm:pt-14 flex items-center justify-center">
        <p className="text-sm text-(--text-secondary)">Loading...</p>
      </div>
    );
  }

  // Show nothing if not authenticated (redirect is happening)
  if (!user) {
    return null;
  }

  // Show message detail view
  if (selectedMessage) {
    return (
      <div className="min-h-screen bg-(--background) pb-16 sm:pb-0 sm:pt-14">
        <Navigation />
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => {
                setSelectedMessage(null);
                setReplyContent('');
              }}
              className="text-sm text-(--accent) hover:underline flex items-center gap-1"
            >
              ← Back to Messages
            </button>
            <h1 className="text-2xl font-bold text-(--foreground)">Message</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>

          {/* Message Detail */}
          <div className="mb-4 rounded-xl bg-(--card-bg) p-4 border border-(--border)">
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
          <div className="rounded-xl bg-(--card-bg) p-4 border border-(--border)">
            <h2 className="mb-3 text-lg font-semibold text-(--foreground)">Reply</h2>
            <form onSubmit={handleReply} className="space-y-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent) text-sm min-h-[100px]"
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
        </main>
      </div>
    );
  }

  // Show messages list
  return (
    <div className="min-h-screen bg-(--background) pb-16 sm:pb-0 sm:pt-14">
      <Navigation />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-(--foreground) flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Messages
            {unreadCount > 0 && (
              <span className="ml-2 rounded-full bg-(--accent) text-white text-xs px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </h1>
        </div>

        {/* Messages List */}
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-(--border) bg-(--card-bg) p-8 text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50 text-(--text-secondary)" />
              <p className="text-sm text-(--text-secondary)">No messages yet</p>
            </div>
          ) : (
            messages.map((message) => (
              <button
                key={message.id}
                onClick={() => handleMessageClick(message)}
                className={`w-full p-4 text-left rounded-xl border border-(--border) bg-(--card-bg) hover:bg-(--border)/50 transition-colors ${
                  !message.read ? 'bg-(--accent)/5 border-(--accent)/20' : ''
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
            ))
          )}
        </div>
      </main>
    </div>
  );
}

