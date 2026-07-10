import Link from 'next/link';
import { Check } from 'lucide-react';
import { FLOW_STEPS } from '@/lib/mock-data';
import { cn } from '@/lib/cn';

type Props = {
  current: (typeof FLOW_STEPS)[number]['id'];
};

export function ProgressStepper({ current }: Props) {
  const currentIndex = FLOW_STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Print progress" className="w-full overflow-x-auto scrollbar-none">
      <ol className="flex min-w-max items-center gap-0.5 px-0.5 py-0.5">
        {FLOW_STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;

          return (
            <li key={step.id} className="flex items-center gap-0.5">
              <Link
                href={step.href}
                className={cn(
                  'group inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-2 py-1.5 text-xs font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
                  active && 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
                  done && !active && 'text-[var(--foreground)] hover:bg-[var(--surface-2)]',
                  !done && !active && 'text-[var(--muted)] hover:text-[var(--muted-strong)]',
                )}
                aria-current={active ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold transition-colors',
                    active && 'bg-[var(--accent)] text-[var(--accent-ink)]',
                    done && !active && 'bg-[var(--success)] text-white',
                    !done && !active && 'bg-[var(--surface-2)] text-[var(--muted)]',
                  )}
                >
                  {done && !active ? (
                    <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </Link>
              {index < FLOW_STEPS.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    'mx-0.5 h-px w-2.5 sm:w-4',
                    done ? 'bg-[var(--success)]/50' : 'bg-[var(--border)]',
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
