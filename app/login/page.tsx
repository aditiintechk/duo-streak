'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!name) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        await register(email, password, name);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className='min-h-screen bg-(--background) flex items-center justify-center px-4'>
        <div className='w-full max-w-md'>
          <div className='rounded-xl bg-(--card-bg) border border-(--border) p-8 shadow-lg'>
            <h1 className='text-2xl font-bold text-(--foreground) mb-2 text-center'>
              Loading...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-(--background) flex items-center justify-center px-4'>
      <div className='w-full max-w-md'>
        <div className='rounded-xl bg-(--card-bg) border border-(--border) p-8 shadow-lg'>
          <h1 className='text-2xl font-bold text-(--foreground) mb-2 text-center'>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className='text-sm text-(--text-secondary) mb-6 text-center'>
            {isLogin
              ? 'Sign in to continue tracking habits'
              : 'Start building better habits together'}
          </p>

          {error && (
            <div className='mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4'>
            {!isLogin && (
              <div>
                <label className='block text-sm font-medium text-(--foreground) mb-1.5'>
                  Name
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='w-full px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)'
                  required={!isLogin}
                  suppressHydrationWarning
                />
              </div>
            )}

            <div>
              <label className='block text-sm font-medium text-(--foreground) mb-1.5'>
                Email
              </label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='w-full px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)'
                required
                suppressHydrationWarning
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-(--foreground) mb-1.5'>
                Password
              </label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='w-full px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)'
                required
                suppressHydrationWarning
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-2.5 rounded-lg bg-(--accent) text-white font-medium hover:bg-(--accent-dark) transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className='text-sm text-(--accent) hover:underline'
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

