import { cn } from '@/lib/cn';
import type { PageMode } from '@/types/print';

type Props = {
  pageNumber: number;
  label: string;
  mode: PageMode;
  tone?: 'light' | 'mid' | 'dark';
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

const toneBg = {
  light: 'from-[#e8eef5] to-[#f7fafc] dark:from-[#1a2333] dark:to-[#121a27]',
  mid: 'from-[#d5e3ef] to-[#eef4f8] dark:from-[#243044] dark:to-[#182233]',
  dark: 'from-[#9fb4c9] to-[#d7e4ef] dark:from-[#334155] dark:to-[#1e293b]',
} as const;

export function PageThumb({
  pageNumber,
  label,
  mode,
  tone = 'light',
  selected,
  onClick,
  className,
}: Props) {
  const Comp = onClick ? 'button' : 'div';

  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group relative aspect-[3/4] w-full overflow-hidden rounded-lg border text-left transition-transform duration-200',
        'border-[var(--border)] bg-gradient-to-br',
        toneBg[tone],
        selected && 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]',
        onClick &&
          'hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
        className,
      )}
      aria-pressed={onClick ? selected : undefined}
      aria-label={`Page ${pageNumber}, ${label}, ${mode === 'color' ? 'color' : 'black and white'}`}
    >
      <div className="absolute inset-x-3 top-3 space-y-1.5 opacity-70">
        <div className="h-1.5 w-3/4 rounded-full bg-[var(--foreground)]/15" />
        <div className="h-1.5 w-full rounded-full bg-[var(--foreground)]/10" />
        <div className="h-1.5 w-5/6 rounded-full bg-[var(--foreground)]/10" />
        {mode === 'color' ? (
          <div className="mt-3 flex gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan-500/80" />
            <span className="h-2 w-2 rounded-full bg-fuchsia-500/70" />
            <span className="h-2 w-2 rounded-full bg-amber-400/80" />
          </div>
        ) : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[var(--surface)]/90 px-2.5 py-2 text-[11px] backdrop-blur-sm">
        <span className="font-medium text-[var(--foreground)]">p.{pageNumber}</span>
        <span className="text-[var(--muted)]">{mode === 'color' ? 'Color' : 'B&W'}</span>
      </div>
    </Comp>
  );
}
