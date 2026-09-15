'use client';

import {
  Eye,
  FileText,
  Image as ImageIcon,
  Layers,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { fetchPdfClassification, type PdfClassificationResult } from '@/lib/ai-api';
import { cn } from '@/lib/cn';

type Props = {
  uploadId: string;
  fileName: string;
  /** Auto-runs on mount */
  autoAnalyze?: boolean;
};

export function PdfVisionClassifier({ uploadId, fileName, autoAnalyze = true }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<PdfClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const data = await fetchPdfClassification({ uploadId, fileName });
      setResult(data);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vision analysis failed.');
      setState('error');
    }
  }, [uploadId, fileName]);

  useEffect(() => {
    if (autoAnalyze) void analyze();
  }, [autoAnalyze, analyze]);

  const densityIcon = {
    text_heavy: FileText,
    image_heavy: ImageIcon,
    mixed: Layers,
  } as const;

  const colorBadge = {
    all_bw: { label: 'B&W recommended', className: 'bg-[var(--surface-2)] text-[var(--foreground)]' },
    all_color: { label: 'Color recommended', className: 'bg-[var(--accent-soft)] text-[var(--accent-strong)]' },
    mixed: { label: 'Mixed mode', className: 'bg-[var(--warning-soft)] text-[var(--warning)]' },
  } as const;

  const confidenceBar = result ? Math.round(result.confidence * 100) : 0;

  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)] border transition-all duration-300',
        state === 'success'
          ? 'border-[var(--accent)]/25 bg-gradient-to-br from-[var(--accent-soft)]/20 to-[var(--surface)]'
          : 'border-[var(--border)] bg-[var(--surface)]',
        'p-4 shadow-[var(--shadow-xs)] sm:p-5',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)]',
              state === 'success' ? 'bg-[var(--accent)] text-[var(--accent-ink)]' : 'bg-[var(--accent-soft)] text-[var(--accent-strong)]',
            )}
          >
            <Eye className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Vision AI</p>
            <p className="text-xs text-[var(--muted)]">PDF content classification</p>
          </div>
        </div>

        {state === 'idle' && (
          <button
            onClick={() => void analyze()}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-ink)] hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Scan PDF
          </button>
        )}

        {state === 'loading' && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Scanning…
          </span>
        )}

        {state === 'error' && (
          <button
            onClick={() => void analyze()}
            className="text-xs font-medium text-[var(--danger)] underline"
          >
            Retry
          </button>
        )}
      </div>

      {/* Error */}
      {state === 'error' && error && (
        <div className="mt-3 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-[var(--danger)]" />
          <p className="text-xs text-[var(--danger)]">{error}</p>
        </div>
      )}

      {/* Loading */}
      {state === 'loading' && (
        <div className="mt-4 space-y-2">
          <div className="skeleton h-4 w-2/3 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
        </div>
      )}

      {/* Result */}
      {state === 'success' && result && (
        <div className="animate-rise mt-4 space-y-3">
          {/* Document type + confidence */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
              <p className="text-sm font-semibold text-[var(--foreground)]">{result.documentType}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--surface-2)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
                  style={{ width: `${confidenceBar}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-[var(--muted)]">{confidenceBar}% confident</span>
            </div>
          </div>

          {/* Content description */}
          <p className="text-xs leading-relaxed text-[var(--muted)]">{result.contentDescription}</p>

          {/* Chips row */}
          <div className="flex flex-wrap gap-2">
            {(() => {
              const badge = colorBadge[result.colorRecommendation] ?? colorBadge.all_bw;
              const Icon = (result.contentDensity && densityIcon[result.contentDensity]) ? densityIcon[result.contentDensity] : FileText;
              const densityLabel = result.contentDensity ? result.contentDensity.replace('_', '-') : 'standard';
              return (
                <>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                      badge.className,
                    )}
                  >
                    {badge.label}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs">
                    <Icon className="h-3 w-3" />
                    {densityLabel}
                  </span>
                </>
              );
            })()}
            <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs">
              {result.orientationHint || 'portrait'}
            </span>
          </div>

          {/* Color reason */}
          <p className="text-xs text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)]">Why: </span>
            {result.colorReason}
          </p>

          {/* Print tip */}
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">Print tip</p>
            <p className="mt-0.5 text-xs text-[var(--foreground)]">{result.printQualityTip}</p>
          </div>

          {result.isMock && (
            <p className="text-center text-[10px] text-[var(--muted)]">
              ✦ Demo mode — set GEMINI_API_KEY for live vision analysis
            </p>
          )}
        </div>
      )}
    </div>
  );
}
