'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sun, Moon, Bell } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const { isSupported, permission, isSubscribed, subscribeToNotifications } = useNotifications();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [partnerInfo, setPartnerInfo] = useState<{ name: string; email: string } | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [loadingPartner, setLoadingPartner] = useState(true);
  const [enablingNotifications, setEnablingNotifications] = useState(false);

  // Redirect to login if not authenticated (in useEffect to avoid render issues)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

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

  useEffect(() => {
    const fetchPartnerInfo = async () => {
      if (!user?.partnerId) {
        setLoadingPartner(false);
        return;
      }

      try {
        const res = await fetch('/api/partner/info', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setPartnerInfo(data.partner);
        }
      } catch (error) {
        console.error('Failed to fetch partner info:', error);
      } finally {
        setLoadingPartner(false);
      }
    };

    if (user) {
      fetchPartnerInfo();
    }
  }, [user]);

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

  const handleLinkPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    setIsLinking(true);

    try {
      const res = await fetch('/api/partner/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ partnerEmail: partnerEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to link partner');
      }

      setPartnerEmail('');
      setShowLinkModal(false);
      await refreshUser();
      // Refresh partner info
      const partnerRes = await fetch('/api/partner/info', {
        credentials: 'include',
      });
      if (partnerRes.ok) {
        const partnerData = await partnerRes.json();
        setPartnerInfo(partnerData.partner);
      }
    } catch (error: any) {
      setLinkError(error.message || 'Failed to link partner');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkPartner = async () => {
    if (!confirm('Are you sure you want to unlink from your partner?')) {
      return;
    }

    try {
      const res = await fetch('/api/partner/unlink', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to unlink');

      setPartnerInfo(null);
      await refreshUser();
    } catch (error: any) {
      alert(error.message || 'Failed to unlink partner');
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

  const profile = {
    name: user.name,
    email: user.email,
    partnerName: partnerInfo?.name || (user.partnerId ? 'Loading...' : 'Not linked'),
    joinedDate: 'January 2024', // TODO: Add createdAt to user model
  };

  return (
    <div className="min-h-screen bg-(--background) pb-16 sm:pb-0 sm:pt-14">
      <Navigation />
      
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="mb-1 text-2xl font-bold text-(--foreground)">Settings</h1>
          <p className="text-sm text-(--text-secondary)">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="mb-4 rounded-xl bg-(--card-bg) p-4 border border-(--border)">
          <h2 className="mb-3 text-lg font-semibold text-(--foreground)">Profile</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-(--text-secondary) mb-0.5">Your Name</p>
                <p className="text-sm font-medium text-(--foreground)">{profile.name}</p>
              </div>
              <button className="text-xs text-(--accent) hover:underline">Edit</button>
            </div>
            <div className="h-px bg-(--border)" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-(--text-secondary) mb-0.5">Email</p>
                <p className="text-sm font-medium text-(--foreground)">{profile.email}</p>
              </div>
              <button className="text-xs text-(--accent) hover:underline">Edit</button>
            </div>
            <div className="h-px bg-(--border)" />
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-(--text-secondary) mb-0.5">Partner</p>
                <p className="text-sm font-medium text-(--foreground)">
                  {loadingPartner ? 'Loading...' : profile.partnerName}
                </p>
                {partnerInfo && (
                  <p className="text-xs text-(--text-secondary) mt-0.5">{partnerInfo.email}</p>
                )}
              </div>
              {user.partnerId ? (
                <button
                  onClick={handleUnlinkPartner}
                  className="text-xs text-red-500 hover:underline"
                >
                  Unlink
                </button>
              ) : (
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="text-xs text-(--accent) hover:underline"
                >
                  Link Partner
                </button>
              )}
            </div>
            <div className="h-px bg-(--border)" />
            <div>
              <p className="text-xs text-(--text-secondary) mb-0.5">Member since</p>
              <p className="text-sm font-medium text-(--foreground)">{profile.joinedDate}</p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-4 rounded-xl bg-(--card-bg) p-4 border border-(--border)">
          <h2 className="mb-3 text-lg font-semibold text-(--foreground)">Stats</h2>
          <Link
            href="/stats"
            className="block w-full text-left text-sm text-(--foreground) hover:text-(--accent) transition-colors py-2"
          >
            View Statistics →
          </Link>
        </div>

        {/* Appearance Section */}
        <div className="mb-4 rounded-xl bg-(--card-bg) p-4 border border-(--border)">
          <h2 className="mb-3 text-lg font-semibold text-(--foreground)">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-(--foreground) mb-0.5">Theme</p>
              <p className="text-xs text-(--text-secondary)">
                {isDark ? 'Dark mode' : 'Light mode'}
              </p>
            </div>
            {mounted && (
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--border) hover:bg-(--accent)/10 transition-all"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-(--foreground)" />
                ) : (
                  <Moon className="h-5 w-5 text-(--foreground)" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Notifications Section */}
        {isSupported && (
          <div className="mb-4 rounded-xl bg-(--card-bg) p-4 border border-(--border)">
            <h2 className="mb-3 text-lg font-semibold text-(--foreground)">Notifications</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-(--foreground) mb-0.5">Push Notifications</p>
                  <p className="text-xs text-(--text-secondary)">
                    {isSubscribed
                      ? 'Enabled - You can receive notifications'
                      : permission === 'denied'
                      ? 'Blocked - Enable in browser settings'
                      : 'Disabled - Enable to receive notifications'}
                  </p>
                </div>
                {!isSubscribed && permission !== 'denied' && (
                  <button
                    onClick={async () => {
                      setEnablingNotifications(true);
                      try {
                        console.log('Starting notification subscription...');
                        const success = await subscribeToNotifications();
                        if (success) {
                          alert('Notifications enabled!');
                          // State will update automatically via useNotifications hook
                        } else {
                          alert('Failed to enable notifications. Please check the browser console for errors and make sure you\'ve built the app with "npm run build".');
                        }
                      } catch (error: any) {
                        console.error('Error enabling notifications:', error);
                        alert(`Failed to enable notifications: ${error.message || 'Unknown error'}. Check the browser console for details.`);
                      } finally {
                        setEnablingNotifications(false);
                      }
                    }}
                    disabled={enablingNotifications}
                    className="flex items-center gap-1.5 rounded-lg bg-(--accent) px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-(--accent-dark) hover:shadow-md disabled:opacity-50"
                  >
                    <Bell className="h-3.5 w-3.5" />
                    {enablingNotifications ? 'Enabling...' : 'Enable'}
                  </button>
                )}
                {isSubscribed && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-(--success)/10 px-3 py-1.5 text-xs font-medium text-(--success)">
                    <Bell className="h-3.5 w-3.5" />
                    Enabled
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Account Actions */}
        <div className="mb-4 rounded-xl bg-(--card-bg) p-4 border border-(--border)">
          <h2 className="mb-3 text-lg font-semibold text-(--foreground)">Account</h2>
          <div className="space-y-2">
            <button className="w-full text-left text-sm text-(--foreground) hover:text-(--accent) transition-colors py-2">
              Change Password
            </button>
            <button className="w-full text-left text-sm text-(--foreground) hover:text-(--accent) transition-colors py-2">
              Notification Preferences
            </button>
            <div className="h-px bg-(--border) my-2" />
            <button
              onClick={async () => {
                await logout();
                router.push('/login');
              }}
              className="w-full text-left text-sm text-red-500 hover:text-red-600 transition-colors py-2"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="rounded-xl bg-(--card-bg) p-4 border border-(--border)">
          <h2 className="mb-3 text-lg font-semibold text-(--foreground)">About</h2>
          <div className="space-y-2 text-xs text-(--text-secondary)">
            <p>DuoStreak v1.0.0</p>
            <p>Build better habits together with your partner</p>
          </div>
        </div>

        {/* Link Partner Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-(--card-bg) border border-(--border) p-6">
              <h2 className="text-xl font-bold text-(--foreground) mb-4">
                Link Partner
              </h2>
              <p className="text-sm text-(--text-secondary) mb-4">
                Enter your partner's email address to link accounts. They must have an account first.
              </p>

              {linkError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                  {linkError}
                </div>
              )}

              <form onSubmit={handleLinkPartner} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-(--foreground) mb-1.5">
                    Partner's Email
                  </label>
                  <input
                    type="email"
                    value={partnerEmail}
                    onChange={(e) => setPartnerEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)"
                    placeholder="partner@example.com"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLinkModal(false);
                      setPartnerEmail('');
                      setLinkError('');
                    }}
                    className="flex-1 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--border) transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLinking}
                    className="flex-1 py-2 rounded-lg bg-(--accent) text-white font-medium hover:bg-(--accent-dark) transition-all disabled:opacity-50"
                  >
                    {isLinking ? 'Linking...' : 'Link Partner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

