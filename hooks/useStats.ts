'use client';

import { useState, useEffect } from 'react';

interface WeeklyData {
  day: string;
  you: number;
  partner: number;
}

interface SharedStreak {
  habit: string;
  streak: number;
  owner: string;
}

interface Stats {
  weeklyData: WeeklyData[];
  yourRate: number;
  partnerRate: number;
  sharedStreaks: SharedStreak[];
  weekCompletion: number;
}

export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stats', {
        credentials: 'include', // Required for cookies to work on iOS
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}

