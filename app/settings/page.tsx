'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function SettingsPage() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check initial theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Mock profile data
  const profile = {
    name: 'Alex',
    email: 'alex@example.com',
    partnerName: 'Jordan',
    joinedDate: 'January 2024',
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-16 sm:pb-0 sm:pt-14">
      <Navigation />
      
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="mb-1 text-2xl font-bold text-[var(--foreground)]">Settings</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="mb-4 rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--border)]">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Profile</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-secondary)] mb-0.5">Your Name</p>
                <p className="text-sm font-medium text-[var(--foreground)]">{profile.name}</p>
              </div>
              <button className="text-xs text-[var(--accent)] hover:underline">Edit</button>
            </div>
            <div className="h-px bg-[var(--border)]" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--text-secondary)] mb-0.5">Email</p>
                <p className="text-sm font-medium text-[var(--foreground)]">{profile.email}</p>
              </div>
              <button className="text-xs text-[var(--accent)] hover:underline">Edit</button>
            </div>
            <div className="h-px bg-[var(--border)]" />
            <div>
              <p className="text-xs text-[var(--text-secondary)] mb-0.5">Partner</p>
              <p className="text-sm font-medium text-[var(--foreground)]">{profile.partnerName}</p>
            </div>
            <div className="h-px bg-[var(--border)]" />
            <div>
              <p className="text-xs text-[var(--text-secondary)] mb-0.5">Member since</p>
              <p className="text-sm font-medium text-[var(--foreground)]">{profile.joinedDate}</p>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="mb-4 rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--border)]">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--foreground)] mb-0.5">Theme</p>
              <p className="text-xs text-[var(--text-secondary)]">
                {isDark ? 'Dark mode' : 'Light mode'}
              </p>
            </div>
            {mounted && (
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--border)] hover:bg-[var(--accent)]/10 transition-all"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-[var(--foreground)]" />
                ) : (
                  <Moon className="h-5 w-5 text-[var(--foreground)]" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="mb-4 rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--border)]">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">Account</h2>
          <div className="space-y-2">
            <button className="w-full text-left text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors py-2">
              Change Password
            </button>
            <button className="w-full text-left text-sm text-[var(--foreground)] hover:text-[var(--accent)] transition-colors py-2">
              Notification Preferences
            </button>
            <div className="h-px bg-[var(--border)] my-2" />
            <button className="w-full text-left text-sm text-red-500 hover:text-red-600 transition-colors py-2">
              Sign Out
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="rounded-xl bg-[var(--card-bg)] p-4 border border-[var(--border)]">
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">About</h2>
          <div className="space-y-2 text-xs text-[var(--text-secondary)]">
            <p>Shared Habit Tracker v1.0.0</p>
            <p>Build better habits together with your partner</p>
          </div>
        </div>
      </main>
    </div>
  );
}

