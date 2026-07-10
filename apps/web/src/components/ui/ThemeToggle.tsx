'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

type Theme = 'light' | 'dark';

function getPreferred(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('smartprint-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const next = getPreferred();
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    window.localStorage.setItem('smartprint-theme', next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'pressable inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-strong)] shadow-[var(--shadow-xs)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
        className,
      )}
      aria-label={
        mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle color theme'
      }
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      )}
    </button>
  );
}
