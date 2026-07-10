'use client';

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
        'inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition-colors hover:bg-[var(--surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
        className,
      )}
      aria-label={
        mounted ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode` : 'Toggle color theme'
      }
    >
      <span aria-hidden className="relative block h-4 w-4">
        {theme === 'dark' ? (
          <span className="absolute inset-0 rounded-full border-2 border-current" />
        ) : (
          <>
            <span className="absolute inset-[3px] rounded-full bg-current" />
            <span className="absolute inset-0 rounded-full border border-current opacity-40" />
          </>
        )}
      </span>
    </button>
  );
}
