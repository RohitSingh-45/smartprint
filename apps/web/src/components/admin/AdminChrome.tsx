'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ListOrdered,
  Menu,
  Printer,
  ShoppingBag,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/cn';

const NAV = [
  {
    href: '/admin',
    label: 'Overview',
    icon: LayoutDashboard,
    match: (path: string) => path === '/admin',
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: ShoppingBag,
    match: (path: string) => path.startsWith('/admin/orders'),
  },
  {
    href: '/admin/queue',
    label: 'Queue',
    icon: ListOrdered,
    match: (path: string) => path.startsWith('/admin/queue'),
  },
  {
    href: '/admin/printers',
    label: 'Printers',
    icon: Printer,
    match: (path: string) => path.startsWith('/admin/printers'),
  },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight transition-opacity hover:opacity-80"
          onClick={onNavigate}
        >
          SmartPrint
        </Link>
        <p className="mt-1 text-xs text-[var(--muted)]">Shop console</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-2.5" aria-label="Shop dashboard">
        {NAV.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  active ? 'text-[var(--accent-strong)]' : 'text-[var(--muted)] group-hover:text-[var(--foreground)]',
                )}
                strokeWidth={1.75}
                aria-hidden
              />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--border)] p-4 text-[11px] leading-relaxed text-[var(--muted)]">
        Print jobs leave the browser at the API — only the Local Print Agent talks to printers.
      </div>
    </aside>
  );
}

export function AdminTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="pressable inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] lg:hidden"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </button>
        <div>
          <p className="text-sm font-medium tracking-tight">Campus Hub</p>
          <p className="text-xs text-[var(--muted)]">Orders · queue · printers</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div
          className="hidden h-8 items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-3 text-[11px] font-medium text-[var(--muted)] sm:inline-flex"
          aria-hidden
        >
          Shop owner
        </div>
      </div>
    </header>
  );
}
