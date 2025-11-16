'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
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

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <button
      onClick={() => {
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
      }}
      className="fixed right-3 top-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-(--card-bg) border border-(--border) text-(--foreground) shadow-sm transition-all hover:bg-(--border) hover:scale-105 sm:right-6 sm:top-6"
      aria-label="Toggle theme"
    >
      <span className="text-sm">{isDark ? '☀️' : '🌙'}</span>
    </button>
  );
}

