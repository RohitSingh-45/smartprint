'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin#queue', label: 'Print queue' },
  { href: '/admin#printers', label: 'Printers' },
  { href: '/admin#orders', label: 'Orders' },
  { href: '/admin#settings', label: 'Settings' },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight"
          onClick={onNavigate}
        >
          SmartPrint
        </Link>
        <p className="mt-1 text-xs text-[var(--muted)]">Shop admin</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Admin">
        {NAV.map((item) => {
          const active = pathname === '/admin' && item.href === '/admin';
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] lg:hidden"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <span aria-hidden className="block h-3.5 w-4">
            <span className="mb-1 block h-0.5 w-full bg-current" />
            <span className="mb-1 block h-0.5 w-full bg-current" />
            <span className="block h-0.5 w-full bg-current" />
          </span>
        </button>
        <div>
          <p className="text-sm font-medium">Campus Hub</p>
          <p className="text-xs text-[var(--muted)]">Today · layout only</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div
          className="hidden h-9 items-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs text-[var(--muted)] sm:inline-flex"
          aria-hidden
        >
          Admin · demo
        </div>
      </div>
    </header>
  );
}
