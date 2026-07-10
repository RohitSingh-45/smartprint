import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

type Action = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
};

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: Action;
  secondaryAction?: Action;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center',
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface-2)] text-[var(--muted)]">
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
      ) : null}
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--muted)]">{description}</p>
      ) : null}
      {(action || secondaryAction) && (
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2 sm:flex-row sm:justify-center">
          {action ? (
            action.href ? (
              <Button href={action.href} variant={action.variant ?? 'primary'} size="sm">
                {action.label}
              </Button>
            ) : (
              <Button
                type="button"
                variant={action.variant ?? 'primary'}
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )
          ) : null}
          {secondaryAction ? (
            secondaryAction.href ? (
              <Button
                href={secondaryAction.href}
                variant={secondaryAction.variant ?? 'secondary'}
                size="sm"
              >
                {secondaryAction.label}
              </Button>
            ) : (
              <Button
                type="button"
                variant={secondaryAction.variant ?? 'secondary'}
                size="sm"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )
          ) : null}
        </div>
      )}
    </div>
  );
}
