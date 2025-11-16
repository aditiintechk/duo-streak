'use client';

import Navigation from '@/components/Navigation';
import ProgressChart from '@/components/ProgressChart';

export default function StatsPage() {
  // Mock data for charts
  const weeklyData = [
    { day: 'Mon', you: 5, partner: 4 },
    { day: 'Tue', you: 6, partner: 5 },
    { day: 'Wed', you: 4, partner: 6 },
    { day: 'Thu', you: 7, partner: 5 },
    { day: 'Fri', you: 5, partner: 7 },
    { day: 'Sat', you: 6, partner: 6 },
    { day: 'Sun', you: 4, partner: 5 },
  ];

  const habitCompletion = [
    { name: 'Completed', value: 75, color: 'var(--success)' },
    { name: 'Pending', value: 25, color: 'var(--text-secondary)' },
  ];

  const sharedStreaks = [
    { habit: 'Morning Meditation', streak: 12, owner: 'both' },
    { habit: 'Evening Walk', streak: 8, owner: 'both' },
    { habit: 'Read Together', streak: 15, owner: 'both' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] pb-16 sm:pb-0 sm:pt-14">
      <Navigation />
      
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Stats</h1>
        </div>

        {/* Stats Cards */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--border)]">
            <p className="mb-1 text-xs text-[var(--text-secondary)]">Your Completion Rate</p>
            <p className="text-2xl font-bold text-[var(--accent)]">82%</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">↑ 5% from last week</p>
          </div>
          <div className="rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--border)]">
            <p className="mb-1 text-xs text-[var(--text-secondary)]">Partner's Rate</p>
            <p className="text-2xl font-bold text-[var(--partner-color)]">78%</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">↑ 3% from last week</p>
          </div>
          <div className="rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--border)]">
            <p className="mb-1 text-xs text-[var(--text-secondary)]">Shared Streak</p>
            <p className="text-2xl font-bold text-[var(--foreground)]">15 days</p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Keep it up! 🔥</p>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="mb-4 rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--border)]">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Weekly Progress</h2>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
              <span className="text-xs text-[var(--text-secondary)]">You</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[var(--partner-color)]" />
              <span className="text-xs text-[var(--text-secondary)]">Partner</span>
            </div>
          </div>
          <ProgressChart data={weeklyData} type="bar" />
        </div>

        {/* Shared Streaks */}
        <div className="mb-4 rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--border)]">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Top Shared Streaks</h2>
          <div className="space-y-2">
            {sharedStreaks.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-[var(--background)] p-3"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{item.habit}</p>
                  <p className="text-xs text-[var(--text-secondary)]">Shared habit</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🔥</span>
                  <span className="text-lg font-bold text-[var(--accent)]">{item.streak}</span>
                  <span className="text-xs text-[var(--text-secondary)]">days</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Pie Chart (simplified) */}
        <div className="rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--border)]">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">This Week's Completion</h2>
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
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - 0.75)}`}
                  className="transition-all"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-[var(--foreground)]">75%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[var(--success)]" />
                <span className="text-xs text-[var(--text-secondary)]">Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[var(--border)]" />
                <span className="text-xs text-[var(--text-secondary)]">Pending</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

