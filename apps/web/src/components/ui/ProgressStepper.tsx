import Link from 'next/link';
import { FLOW_STEPS } from '@/lib/mock-data';
import { cn } from '@/lib/cn';

type Props = {
  current: (typeof FLOW_STEPS)[number]['id'];
};

export function ProgressStepper({ current }: Props) {
  const currentIndex = FLOW_STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Print progress" className="w-full overflow-x-auto">
      <ol className="flex min-w-max items-center gap-1 px-1 py-1">
        {FLOW_STEPS.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;

          return (
            <li key={step.id} className="flex items-center gap-1">
              <Link
                href={step.href}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                  active && 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
                  done && !active && 'text-[var(--foreground)]',
                  !done && !active && 'text-[var(--muted)]',
                )}
                aria-current={active ? 'step' : undefined}
              >
                <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-2)] text-[10px]">
                  {index + 1}
                </span>
                {step.label}
              </Link>
              {index < FLOW_STEPS.length - 1 ? (
                <span aria-hidden className="mx-0.5 h-px w-3 bg-[var(--border)]" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
