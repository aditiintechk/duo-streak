'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  relatedHabitId?: string | null;
  relatedHabitTitle?: string | null;
  relatedTodoId?: string | null;
  relatedTodoText?: string | null;
  parentMessageId?: string | null;
  parentMessageContent?: string | null;
  read: boolean;
  createdAt: string;
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/messages', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data.messages);
      setUnreadCount(data.unreadCount);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to mark as read');
      await fetchMessages(); // Refresh messages
    } catch (err: any) {
      console.error('Error marking message as read:', err);
    }
  }, [fetchMessages]);

  const sendMessage = useCallback(async (
    content: string,
    relatedHabitId?: string,
    relatedTodoId?: string,
    parentMessageId?: string
  ): Promise<boolean> => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content,
          relatedHabitId,
          relatedTodoId,
          parentMessageId,
        }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      await fetchMessages(); // Refresh messages
      return true;
    } catch (err: any) {
      console.error('Error sending message:', err);
      return false;
    }
  }, [fetchMessages]);

  return {
    messages,
    unreadCount,
    loading,
    error,
    fetchMessages,
    markAsRead,
    sendMessage,
  };
}

