'use client';

import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  TrendingDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { fetchConfigAdvisor, type ConfigAdvisorResult } from '@/lib/ai-api';
import { cn } from '@/lib/cn';

type Props = {
  fileName: string;
  totalPages: number;
  colorPageCount: number;
  bwPageCount: number;
  currentCopies: number;
  currentPaperSize: string;
  currentOrientation: string;
  /** Called when user clicks "Apply suggestions" */
  onApply?: (suggestion: ConfigAdvisorResult) => void;
};

type State = 'idle' | 'loading' | 'success' | 'error';

export function PrintConfigAdvisor({
  fileName,
  totalPages,
  colorPageCount,
  bwPageCount,
  currentCopies,
  currentPaperSize,
  currentOrientation,
  onApply,
}: Props) {
  const [state, setState] = useState<State>('idle');
  const [result, setResult] = useState<ConfigAdvisorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const analyze = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const advice = await fetchConfigAdvisor({
        fileName,
        totalPages,
        colorPageCount,
        bwPageCount,
        currentCopies,
        currentPaperSize,
        currentOrientation,
      });
      setResult(advice);
      setState('success');
      setExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI analysis failed.');
      setState('error');
    }
  }, [
    fileName,
    totalPages,
    colorPageCount,
    bwPageCount,
    currentCopies,
    currentPaperSize,
    currentOrientation,
  ]);

  const colorModeLabel = (mode: ConfigAdvisorResult['suggestedColorMode']) => {
    if (mode === 'all_bw') return 'All Black & White';
    if (mode === 'all_color') return 'All Color';
    return 'Mixed (some color, some B&W)';
  };

  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)] border transition-all duration-300',
        state === 'success'
          ? 'border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent-soft)]/30 to-[var(--surface)]'
          : 'border-[var(--border)] bg-[var(--surface)]',
        'shadow-[var(--shadow-xs)]',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 sm:p-5">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors',
            state === 'success'
              ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
              : 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
          )}
        >
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">AI Print Advisor</p>
          <p className="text-xs text-[var(--muted)]">
            {state === 'success'
              ? (result?.documentType ?? 'Analysis complete')
              : 'Get smart recommendations for your document'}
          </p>
        </div>

        {state === 'idle' && (
          <button
            onClick={() => void analyze()}
            className="pressable inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-ink)] shadow-[var(--shadow-sm)] hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Analyze
          </button>
        )}

        {state === 'loading' && (
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-strong)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Analyzing…
          </span>
        )}

        {state === 'error' && (
          <button
            onClick={() => void analyze()}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger-soft)] px-3 py-1.5 text-xs font-medium text-[var(--danger)]"
          >
            Retry
          </button>
        )}

        {state === 'success' && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-[var(--radius-md)] p-1 text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Error */}
      {state === 'error' && error && (
        <div className="mx-4 mb-4 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" />
          <p className="text-xs text-[var(--danger)]">{error}</p>
        </div>
      )}

      {/* Result */}
      {state === 'success' && result && expanded && (
        <div className="animate-rise space-y-4 border-t border-[var(--border)] px-4 pb-5 pt-4 sm:px-5">
          {/* Recommendation */}
          <p className="text-sm leading-relaxed text-[var(--foreground)]">
            {result.recommendation}
          </p>

          {/* Suggestion chips */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <SuggestionChip label="Mode" value={colorModeLabel(result.suggestedColorMode)} />
            <SuggestionChip label="Paper" value={result.suggestedPaperSize.toUpperCase()} />
            <SuggestionChip label="Orientation" value={capitalize(result.suggestedOrientation)} />
            <SuggestionChip label="Copies" value={String(result.suggestedCopies)} />
            {result.costSaving && (
              <div className="col-span-2 flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--success-soft)] px-3 py-2">
                <TrendingDown className="h-3.5 w-3.5 shrink-0 text-[var(--success)]" />
                <p className="text-xs font-medium text-[var(--success)]">{result.costSaving}</p>
              </div>
            )}
          </div>

          {/* Tips */}
          {result.tips.length > 0 && (
            <div className="space-y-1.5">
              {result.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--warning)]" />
                  <p className="text-xs text-[var(--muted)]">{tip}</p>
                </div>
              ))}
            </div>
          )}

          {/* Apply button */}
          {onApply && (
            <button
              onClick={() => onApply(result)}
              className="pressable w-full rounded-[var(--radius-md)] border border-[var(--accent)]/30 bg-[var(--accent-soft)]/50 py-2 text-sm font-semibold text-[var(--accent-strong)] transition-colors hover:bg-[var(--accent-soft)]"
            >
              Apply AI suggestions
            </button>
          )}

          {result.isMock && (
            <p className="text-center text-[10px] text-[var(--muted)]">
              ✦ Demo mode — set GEMINI_API_KEY for live AI
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
