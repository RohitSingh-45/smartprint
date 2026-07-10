import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
  actions?: React.ReactNode;
};

export function ScreenShell({
  children,
  title,
  subtitle,
  showBrand = true,
  actions,
}: Props) {
  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-10 pt-4 sm:max-w-2xl sm:px-6">
        <header className="mb-7 flex items-center justify-between gap-3">
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

        {(title || subtitle) && (
          <div className="mb-7 animate-rise">
            {title ? (
              <h1 className="font-[family-name:var(--font-display)] text-[1.65rem] font-semibold leading-tight tracking-tight sm:text-3xl">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-2.5 max-w-prose text-[15px] leading-relaxed text-[var(--muted)]">
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
