'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckSquare2, ListTodo, BarChart3, Settings } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Habits', icon: CheckSquare2 },
    { href: '/todo', label: 'To-Do', icon: ListTodo },
    { href: '/stats', label: 'Stats', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--card-bg)]/80 backdrop-blur-md shadow-lg sm:top-0 sm:bottom-auto sm:border-b sm:border-t-0 sm:shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-around px-3 py-2 sm:justify-start sm:gap-6 sm:px-6 sm:py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:flex-row sm:gap-1.5 ${
                isActive
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)] scale-105'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--border)]/50 hover:text-[var(--foreground)]'
              }`}
            >
              <item.icon className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

