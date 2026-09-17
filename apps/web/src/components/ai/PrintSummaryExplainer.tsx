'use client';

import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useCallback } from 'react';
import { fetchSummaryExplainer, type SummaryExplainerResult } from '@/lib/ai-api';

type Props = {
  fileName: string;
  totalPages: number;
  printablePages: number;
  colorPages: number;
  bwPages: number;
  copies: number;
  paperSize: string;
  orientation: string;
  estimatedCost: number;
};

export function PrintSummaryExplainer({
  fileName,
  totalPages,
  printablePages,
  colorPages,
  bwPages,
  copies,
  paperSize,
  orientation,
  estimatedCost,
}: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<SummaryExplainerResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const explain = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const data = await fetchSummaryExplainer({
        fileName,
        totalPages,
        printablePages,
        colorPages,
        bwPages,
        copies,
        paperSize,
        orientation,
        estimatedCost,
      });
      setResult(data);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI explanation failed.');
      setState('error');
    }
  }, [
    fileName,
    totalPages,
    printablePages,
    colorPages,
    bwPages,
    copies,
    paperSize,
    orientation,
    estimatedCost,
  ]);

  if (state === 'idle') {
    return (
      <button
        onClick={() => void explain()}
        className="pressable group flex w-full items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--accent)]/20 bg-gradient-to-r from-[var(--accent-soft)]/40 to-[var(--surface)] px-4 py-3.5 text-left shadow-[var(--shadow-xs)] transition-all hover:border-[var(--accent)]/40 hover:from-[var(--accent-soft)]/60"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-ink)] shadow-[var(--shadow-sm)]">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--foreground)]">What does this mean?</p>
          <p className="text-xs text-[var(--muted)]">Let AI explain your order in plain English</p>
        </div>
        <span className="text-xs font-semibold text-[var(--accent-strong)] opacity-0 transition-opacity group-hover:opacity-100">
          Ask AI →
        </span>
      </button>
    );
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center gap-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--accent-strong)]" />
        <p className="text-sm text-[var(--muted)]">AI is reading your order…</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex items-start gap-3 rounded-[var(--radius-xl)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] px-4 py-3.5">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" />
        <div>
          <p className="text-sm text-[var(--danger)]">{error}</p>
          <button
            onClick={() => void explain()}
            className="mt-1 text-xs font-medium text-[var(--danger)] underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (state === 'success' && result) {
    return (
      <div className="animate-rise rounded-[var(--radius-xl)] border border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent-soft)]/30 to-[var(--surface)] px-4 py-4 shadow-[var(--shadow-xs)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-ink)]">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-strong)]">
            AI Summary
          </p>
        </div>
        <p className="text-sm leading-relaxed text-[var(--foreground)]">{result.explanation}</p>
        {result.valueNote && (
          <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--surface-2)] px-3 py-2 text-xs leading-relaxed text-[var(--foreground)]">
            {result.valueNote}
          </p>
        )}
        {result.readyToOrder && (
          <div className="mt-3 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
            <p className="text-xs font-medium text-[var(--success)]">
              Everything looks good — ready to proceed to payment
            </p>
          </div>
        )}
        {result.isMock && (
          <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
            ✦ Demo mode — set GEMINI_API_KEY for live AI
          </p>
        )}
      </div>
    );
  }

  return null;
}
