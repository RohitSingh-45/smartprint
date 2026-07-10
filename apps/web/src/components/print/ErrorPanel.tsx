import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ERROR_COPY, type ErrorKind } from '@/lib/mock-data';

type Props = {
  kind: ErrorKind;
};

export function ErrorPanel({ kind }: Props) {
  const copy = ERROR_COPY[kind];

  return (
    <div className="flex flex-1 flex-col">
      <div className="rounded-[var(--radius-xl)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] p-5 sm:p-6">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface)]/70 text-[var(--danger)]">
          <AlertTriangle className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="text-label text-[var(--danger)]">Something went wrong</p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          {copy.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]/80">{copy.body}</p>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href={copy.primaryHref} fullWidth size="lg">
          {copy.primaryLabel}
        </Button>
        <Button href={copy.secondaryHref} variant="secondary" fullWidth>
          {copy.secondaryLabel}
        </Button>
      </div>
    </div>
  );
}
