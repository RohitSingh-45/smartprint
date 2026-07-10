import { MOCK_STATUS_STEPS } from '@/lib/mock-data';
import { cn } from '@/lib/cn';

export function StatusTimeline() {
  return (
    <ol className="space-y-0">
      {MOCK_STATUS_STEPS.map((step, index) => {
        const isLast = index === MOCK_STATUS_STEPS.length - 1;
        return (
          <li key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden
                className="absolute left-[11px] top-7 h-[calc(100%-1.25rem)] w-px bg-[var(--border)]"
              />
            ) : null}
            <span
              className={cn(
                'relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
                step.state === 'done' && 'border-[var(--success)] bg-[var(--success)] text-white',
                step.state === 'current' &&
                  'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-strong)] animate-pulse-soft',
                step.state === 'upcoming' &&
                  'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]',
              )}
              aria-hidden
            >
              {step.state === 'done' ? '✓' : index + 1}
            </span>
            <div>
              <p className="font-medium">{step.label}</p>
              <p className="mt-0.5 text-sm text-[var(--muted)]">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
