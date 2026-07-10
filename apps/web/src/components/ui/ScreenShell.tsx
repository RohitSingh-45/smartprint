import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBrand?: boolean;
};

export function ScreenShell({ children, title, subtitle, showBrand = true }: Props) {
  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-8 pt-4 sm:max-w-2xl sm:px-6">
        <header className="mb-6 flex items-center justify-between gap-3">
          {showBrand ? (
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            >
              SmartPrint
            </Link>
          ) : (
            <span />
          )}
          <ThemeToggle />
        </header>

        {(title || subtitle) && (
          <div className="mb-6 animate-rise">
            {title ? (
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
              </h1>
            ) : null}
            {subtitle ? (
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{subtitle}</p>
            ) : null}
          </div>
        )}

        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
