import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

type Props = {
  children: React.ReactNode;
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
  dot?: boolean;
};

const toneClass: Record<Tone, string> = {
  neutral: 'bg-[var(--surface-2)] text-[var(--muted-strong)] border-[var(--border)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent-strong)] border-transparent',
  success: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)] border-transparent',
  info: 'bg-[var(--info-soft)] text-[var(--info)] border-transparent',
};

const dotClass: Record<Tone, string> = {
  neutral: 'bg-[var(--muted)]',
  accent: 'bg-[var(--accent)]',
  success: 'bg-[var(--success)]',
  warning: 'bg-[var(--warning)]',
  danger: 'bg-[var(--danger)]',
  info: 'bg-[var(--info)]',
};

export function Badge({ children, tone = 'neutral', icon: Icon, className, dot }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-wide',
        toneClass[tone],
        className,
      )}
    >
      {dot ? (
        <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClass[tone])} aria-hidden />
      ) : null}
      {Icon ? <Icon className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden /> : null}
      {children}
    </span>
  );
}
