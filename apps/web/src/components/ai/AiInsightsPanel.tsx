'use client';

import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Activity,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { fetchDashboardInsights, type DashboardInsightsResult, type DashboardInsight } from '@/lib/ai-api';
import { cn } from '@/lib/cn';

export function AiInsightsPanel() {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<DashboardInsightsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    setError(null);
    try {
      const insights = await fetchDashboardInsights();
      setResult(insights);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load AI insights.');
      setState('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const statusConfig = {
    healthy: {
      border: 'border-[var(--success)]/25',
      bg: 'from-[var(--success-soft)]/30 to-[var(--surface)]',
      badge: 'bg-[var(--success-soft)] text-[var(--success)]',
      dot: 'bg-[var(--success)]',
      label: 'Healthy',
    },
    warning: {
      border: 'border-[var(--warning)]/30',
      bg: 'from-[var(--warning-soft)]/30 to-[var(--surface)]',
      badge: 'bg-[var(--warning-soft)] text-[var(--warning)]',
      dot: 'bg-[var(--warning)]',
      label: 'Needs Attention',
    },
    critical: {
      border: 'border-[var(--danger)]/30',
      bg: 'from-[var(--danger-soft)]/30 to-[var(--surface)]',
      badge: 'bg-[var(--danger-soft)] text-[var(--danger)]',
      dot: 'bg-[var(--danger)]',
      label: 'Critical',
    },
  };

  const s = result ? statusConfig[result.status] : statusConfig.healthy;

  return (
    <section
      className={cn(
        'rounded-[var(--radius-xl)] border bg-gradient-to-br p-5 shadow-[var(--shadow-sm)] sm:p-6',
        result ? s.border : 'border-[var(--border)]',
        result ? s.bg : 'from-[var(--surface)] to-[var(--surface)]',
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-ink)] shadow-[var(--shadow-sm)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight">
              AI Insights
            </h2>
            <p className="text-xs text-[var(--muted)]">
              {state === 'loading' ? 'Analyzing your operations…' : result?.headline ?? 'Real-time operational analysis'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {result && (
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                s.badge,
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse-soft', s.dot)} />
              {s.label}
            </span>
          )}
          <button
            onClick={() => void load()}
            disabled={state === 'loading'}
            className="rounded-[var(--radius-md)] p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] disabled:opacity-50"
            aria-label="Refresh AI insights"
          >
            {state === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {state === 'loading' && (
        <div className="mt-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-[var(--radius-lg)]" />
          ))}
        </div>
      )}

      {/* Error */}
      {state === 'error' && error && (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-4">
          <p className="text-sm text-[var(--danger)]">{error}</p>
          <button
            onClick={() => void load()}
            className="mt-2 text-xs font-medium text-[var(--danger)] underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Success */}
      {state === 'success' && result && (
        <div className="animate-rise mt-5 space-y-3">
          {/* Summary */}
          <p className="rounded-[var(--radius-md)] bg-[var(--surface-2)]/60 px-3 py-2.5 text-sm leading-relaxed text-[var(--foreground)]">
            {result.summary}
          </p>

          {/* Insight cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            {result.insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>

          {result.isMock && (
            <p className="text-center text-[10px] text-[var(--muted)]">
              ✦ Demo mode — set GEMINI_API_KEY for live AI
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function InsightCard({ insight }: { insight: DashboardInsight }) {
  const icons = {
    revenue: TrendingUp,
    queue: Activity,
    warning: AlertTriangle,
    tip: Lightbulb,
    anomaly: AlertTriangle,
  } as const;

  const colors = {
    revenue: 'text-[var(--success)] bg-[var(--success-soft)]',
    queue: 'text-[var(--accent-strong)] bg-[var(--accent-soft)]',
    warning: 'text-[var(--warning)] bg-[var(--warning-soft)]',
    tip: 'text-[var(--info)] bg-[var(--info-soft)]',
    anomaly: 'text-[var(--danger)] bg-[var(--danger-soft)]',
  } as const;

  const Icon = icons[insight.type] ?? CheckCircle2;
  const colorClass = colors[insight.type] ?? colors.tip;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-xs)]">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)]',
            colorClass,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-[var(--foreground)]">
            {insight.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{insight.body}</p>
          {insight.action && (
            <p className="mt-2 text-xs font-medium text-[var(--accent-strong)]">
              → {insight.action}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
