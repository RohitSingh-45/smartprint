import { cn } from '@/lib/cn';

type Props = {
  label?: string;
  value?: number;
  indeterminate?: boolean;
  className?: string;
};

export function ProgressBar({ label, value = 0, indeterminate, className }: Props) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={cn('w-full', className)}>
      {label ? (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="text-[var(--muted)]">{label}</span>
          {!indeterminate ? (
            <span className="tabular-nums font-medium text-[var(--foreground)]">{clamped}%</span>
          ) : null}
        </div>
      ) : null}
      <div
        className="relative h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : clamped}
        aria-label={label ?? 'Progress'}
      >
        {indeterminate ? (
          <div
            className="absolute inset-y-0 w-2/5 rounded-full bg-[var(--accent)]"
            style={{ animation: 'progress-indeterminate 1.1s ease-in-out infinite' }}
          />
        ) : (
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-out"
            style={{ width: `${clamped}%` }}
          />
        )}
      </div>
    </div>
  );
}
