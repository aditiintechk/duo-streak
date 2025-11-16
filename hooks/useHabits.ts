'use client';

import { useState, useEffect } from 'react';

interface Habit {
  id: string;
  title: string;
  streak: number;
  completed: boolean;
  owner: 'me' | 'partner' | 'shared';
  sharedCompletion?: {
    user: boolean;
    partner: boolean;
  };
}

export function useHabits(filter: 'my' | 'partner' | 'shared' = 'my') {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/habits?filter=${filter}`);
      if (!res.ok) throw new Error('Failed to fetch habits');
      const data = await res.json();
      setHabits(data.habits);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [filter]);

  const toggleHabit = async (id: string) => {
    try {
      const res = await fetch(`/api/habits/${id}/toggle`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to toggle habit');
      await fetchHabits(); // Refresh
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createHabit = async (title: string, owner: 'me' | 'partner' | 'shared') => {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, owner }),
      });
      if (!res.ok) throw new Error('Failed to create habit');
      await fetchHabits(); // Refresh
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      const res = await fetch(`/api/habits/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete habit');
      await fetchHabits(); // Refresh
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { habits, loading, error, toggleHabit, createHabit, deleteHabit, refetch: fetchHabits };
}

