'use client';

import {
  Sparkles,
  Clock,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { fetchEtaPrediction, type EtaPredictionResult } from '@/lib/ai-api';
import { cn } from '@/lib/cn';

type Props = {
  queuePosition: number | null;
  jobsAhead: number | null;
  totalPages: number;
  colorPages: number;
  bwPages: number;
  copies: number;
  paperSize: string;
  currentStatus: string;
};

export function SmartEtaPredictor({
  queuePosition,
  jobsAhead,
  totalPages,
  colorPages,
  bwPages,
  copies,
  paperSize,
  currentStatus,
}: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<EtaPredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const data = await fetchEtaPrediction({
        queuePosition: queuePosition ?? 1,
        jobsAhead: jobsAhead ?? 0,
        totalPages: totalPages || 1,
        colorPages: colorPages || 0,
        bwPages: bwPages || 1,
        copies: copies || 1,
        paperSize: paperSize || 'a4',
        currentStatus,
      });
      setResult(data);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to forecast wait time.');
      setState('error');
    }
  }, [queuePosition, jobsAhead, totalPages, colorPages, bwPages, copies, paperSize, currentStatus]);

  useEffect(() => {
    void predict();
  }, [predict]);

  const rushColors = {
    low: { label: 'Low Queue Wait', bg: 'bg-[var(--success-soft)]', text: 'text-[var(--success)]', border: 'border-[var(--success)]/20' },
    moderate: { label: 'Moderate Rush', bg: 'bg-[var(--warning-soft)]', text: 'text-[var(--warning)]', border: 'border-[var(--warning)]/20' },
    high: { label: 'Campus Peak Rush', bg: 'bg-[var(--danger-soft)]', text: 'text-[var(--danger)]', border: 'border-[var(--danger)]/20' },
  } as const;

  const isTerminal = ['COMPLETED', 'COLLECTED'].includes(currentStatus.toUpperCase());
  const isPrinting = currentStatus.toUpperCase() === 'PRINTING';

  return (
    <section
      aria-label="AI queue readiness prediction"
      className={cn(
        'rounded-[var(--radius-xl)] border transition-all duration-300 p-5 shadow-[var(--shadow-xs)]',
        isTerminal
          ? 'border-[var(--success)]/30 bg-gradient-to-br from-[var(--success-soft)]/30 via-[var(--surface)] to-[var(--surface-2)]'
          : isPrinting
          ? 'border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent-soft)]/25 via-[var(--surface)] to-[var(--surface-2)]'
          : 'border-[var(--border)] bg-[var(--surface)]',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] shadow-[var(--shadow-xs)]',
              isTerminal
                ? 'bg-[var(--success)] text-white'
                : 'bg-gradient-to-br from-[var(--accent)] to-purple-600 text-white',
            )}
          >
            {isTerminal ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight">
                {isTerminal ? 'Print Ready' : 'Smart Queue Intelligence'}
              </h2>
              <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-strong)]">
                AI Powered
              </span>
            </div>
            <p className="text-xs text-[var(--muted)]">
              {isTerminal
                ? 'Job completed & waiting for you'
                : 'Dynamic ETA based on campus queue conditions'}
            </p>
          </div>
        </div>

        {state === 'loading' && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Forecasting…
          </span>
        )}
      </div>

      {/* Error state */}
      {state === 'error' && error && (
        <div className="mt-3 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[var(--danger)] shrink-0" />
            <p className="text-xs text-[var(--danger)]">{error}</p>
          </div>
          <button
            onClick={() => void predict()}
            className="text-xs font-semibold text-[var(--danger)] underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {state === 'loading' && !result && (
        <div className="mt-4 space-y-2">
          <div className="skeleton h-10 w-full rounded-[var(--radius-md)]" />
          <div className="skeleton h-6 w-3/4 rounded" />
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="animate-rise mt-4 space-y-3">
          {/* Highlight ETA Card */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)]/80 p-3.5">
            <div className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-[var(--accent-strong)] shrink-0" />
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                  Estimated Ready Window
                </p>
                <p className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-[var(--foreground)]">
                  {result.estimatedTimeLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
                  rushColors[result.rushLevel].bg,
                  rushColors[result.rushLevel].text,
                  rushColors[result.rushLevel].border,
                )}
              >
                <Users className="h-3 w-3" />
                {rushColors[result.rushLevel].label}
              </span>
            </div>
          </div>

          {/* Rush Condition & Pickup Advice */}
          <div className="space-y-1.5 text-xs">
            <p className="text-[var(--muted)]">
              <span className="font-semibold text-[var(--foreground)]">Condition: </span>
              {result.rushReason}
            </p>
            <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--accent)]/15 bg-[var(--accent-soft)]/30 p-2.5">
              <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-strong)]" />
              <p className="font-medium text-[var(--foreground)]">
                <span className="text-[var(--accent-strong)]">Pickup Tip: </span>
                {result.pickupAdvice}
              </p>
            </div>
          </div>

          {result.isMock && (
            <p className="text-right text-[10px] text-[var(--muted)]">
              ✦ AI Queue Forecast ({Math.round(result.confidence * 100)}% confidence)
            </p>
          )}
        </div>
      )}
    </section>
  );
}
