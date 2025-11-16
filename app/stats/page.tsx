'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import ProgressChart from '@/components/ProgressChart';
import { useStats } from '@/hooks/useStats';
import { useAuth } from '@/contexts/AuthContext';

export default function StatsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { stats, loading } = useStats();

  // Redirect to login if not authenticated (in useEffect to avoid render issues)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

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

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-(--background) pb-16 sm:pb-0 sm:pt-14">
        <Navigation />
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-(--foreground)">Stats</h1>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--card-bg) p-8 text-center">
            <p className="text-sm text-(--text-secondary)">Loading stats...</p>
          </div>
        </main>
      </div>
    );
  }

  const maxSharedStreak =
    stats.sharedStreaks.length > 0
      ? Math.max(...stats.sharedStreaks.map((s) => s.streak))
      : 0;

  return (
    <div className="min-h-screen bg-(--background) pb-16 sm:pb-0 sm:pt-14">
      <Navigation />
      
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-(--foreground)">Stats</h1>
        </div>

        {/* Stats Cards */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-(--card-bg) p-4 border border-(--border)">
            <p className="mb-1 text-xs text-(--text-secondary)">Your Completion Rate</p>
            <p className="text-2xl font-bold text-(--accent)">{stats.yourRate}%</p>
            <p className="mt-1 text-xs text-(--text-secondary)">Today's completion</p>
          </div>
          <div className="rounded-xl bg-(--card-bg) p-4 border border-(--border)">
            <p className="mb-1 text-xs text-(--text-secondary)">Partner's Rate</p>
            <p className="text-2xl font-bold text-(--partner-color)">{stats.partnerRate}%</p>
            <p className="mt-1 text-xs text-(--text-secondary)">Today's completion</p>
          </div>
          <div className="rounded-xl bg-(--card-bg) p-4 border border-(--border)">
            <p className="mb-1 text-xs text-(--text-secondary)">Shared Streak</p>
            <p className="text-2xl font-bold text-(--foreground)">{maxSharedStreak} days</p>
            <p className="mt-1 text-xs text-(--text-secondary)">
              {maxSharedStreak > 0 ? 'Keep it up! 🔥' : 'No shared streaks yet'}
            </p>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="mb-4 rounded-xl bg-(--card-bg) p-4 border border-(--border)">
          <h2 className="mb-3 text-lg font-semibold text-(--foreground)">Weekly Progress</h2>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-(--accent)" />
              <span className="text-xs text-(--text-secondary)">You</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-(--partner-color)" />
              <span className="text-xs text-(--text-secondary)">Partner</span>
            </div>
          </div>
          <ProgressChart data={stats.weeklyData} type="bar" />
        </div>

        {/* Shared Streaks */}
        <div className="mb-4 rounded-xl bg-(--card-bg) p-4 border border-(--border)">
          <h2 className="mb-3 text-lg font-semibold text-(--foreground)">Top Shared Streaks</h2>
          <div className="space-y-2">
            {stats.sharedStreaks.length > 0 ? (
              stats.sharedStreaks.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-(--background) p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-(--foreground)">{item.habit}</p>
                    <p className="text-xs text-(--text-secondary)">Shared habit</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🔥</span>
                    <span className="text-lg font-bold text-(--accent)">{item.streak}</span>
                    <span className="text-xs text-(--text-secondary)">days</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg bg-(--background) p-3 text-center">
                <p className="text-sm text-(--text-secondary)">No shared streaks yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Completion Pie Chart (simplified) */}
        <div className="rounded-xl bg-(--card-bg) p-4 border border-(--border)">
          <h2 className="mb-3 text-lg font-semibold text-(--foreground)">This Week's Completion</h2>
          <div className="flex items-center justify-center gap-6">
            <div className="relative h-24 w-24">
              <svg className="h-24 w-24 -rotate-90 transform">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="12"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - stats.weekCompletion / 100)}`}
                  className="transition-all"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-(--foreground)">{stats.weekCompletion}%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-(--success)" />
                <span className="text-xs text-(--text-secondary)">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-(--border)" />
                <span className="text-xs text-(--text-secondary)">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

