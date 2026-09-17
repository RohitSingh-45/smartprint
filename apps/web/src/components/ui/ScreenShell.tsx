import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/cn';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
  actions?: React.ReactNode;
  eyebrow?: string;
  compact?: boolean;
};

export function ScreenShell({
  children,
  title,
  subtitle,
  showBrand = true,
  actions,
  eyebrow,
  compact = false,
}: Props) {
  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div
        className={cn(
          'mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 sm:max-w-2xl sm:px-6',
          compact ? 'pb-8 pt-3' : 'pb-10 pt-4',
        )}
      >
        <header
          className={cn('flex items-center justify-between gap-3', compact ? 'mb-5' : 'mb-6')}
        >
          {showBrand ? (
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--foreground)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)] rounded-[var(--radius-sm)]"
            >
              SmartPrint
            </Link>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {actions}
            <ThemeToggle />
          </div>
        </header>

        {(title || subtitle || eyebrow) && (
          <div className={cn('animate-rise', compact ? 'mb-5' : 'mb-6')}>
            {eyebrow ? <p className="mb-2 text-label">{eyebrow}</p> : null}
            {title ? (
              <h1
                className={cn(
                  'font-[family-name:var(--font-display)] font-semibold leading-tight tracking-tight',
                  compact ? 'text-xl sm:text-2xl' : 'text-[1.65rem] sm:text-3xl',
                )}
              >
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-[var(--muted)]">
                {subtitle}
              </p>
            ) : null}
          </div>
        )}

        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
