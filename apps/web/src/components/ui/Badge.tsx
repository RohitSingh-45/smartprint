import { cn } from '@/lib/cn';

type Props = {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  className?: string;
};

const toneClass = {
  neutral: 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent-strong)] border-transparent',
  success: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
  warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)] border-transparent',
} as const;

export function Badge({ children, tone = 'neutral', className }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium tracking-wide',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
