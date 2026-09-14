'use client';

import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  BarChart3,
  Zap,
  ShoppingBag,
  Activity,
  RefreshCw,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { fetchTrendAnalysis, type TrendAnalysisResult, type TrendItem } from '@/lib/ai-api';
import { cn } from '@/lib/cn';

const WINDOW_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

export function TrendAnalysisPanel() {
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [result, setResult] = useState<TrendAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const load = useCallback(async (d: number) => {
    setState('loading');
    setError(null);
    try {
      const data = await fetchTrendAnalysis(d);
      setResult(data);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load trend analysis.');
      setState('error');
    }
  }, []);

  useEffect(() => {
    void load(days);
  }, [load, days]);

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--accent)] to-purple-500 text-white shadow-[var(--shadow-sm)]">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight">
              RAG Trend Analysis
            </h2>
            <p className="text-xs text-[var(--muted)]">
              AI-powered business intelligence over order history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Window selector */}
          <div className="flex rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-0.5">
            {WINDOW_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={cn(
                  'rounded-[var(--radius-sm)] px-2.5 py-1 text-xs font-medium transition-colors',
                  days === opt.value
                    ? 'bg-[var(--accent)] text-[var(--accent-ink)] shadow-[var(--shadow-xs)]'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => void load(days)}
            disabled={state === 'loading'}
            className="rounded-[var(--radius-md)] p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] disabled:opacity-50"
            aria-label="Refresh trends"
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
          <div className="skeleton h-12 rounded-[var(--radius-lg)]" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-28 rounded-[var(--radius-lg)]" />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {state === 'error' && error && (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-4">
          <p className="text-sm text-[var(--danger)]">{error}</p>
          <button onClick={() => void load(days)} className="mt-2 text-xs font-medium text-[var(--danger)] underline">
            Retry
          </button>
        </div>
      )}

      {/* Success */}
      {state === 'success' && result && (
        <div className="animate-rise mt-5 space-y-4">
          {/* Top insight banner */}
          <div className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--accent)]/20 bg-gradient-to-r from-[var(--accent-soft)]/50 to-[var(--surface-2)] px-4 py-3">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-strong)]" />
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{result.topInsight}</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{result.forecastNote}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <StatPill label="Orders" value={String(result.totalOrders)} icon={ShoppingBag} />
            <StatPill label="Revenue" value={`₹${result.totalRevenue.toLocaleString('en-IN')}`} icon={TrendingUp} />
            <StatPill label="Period" value={result.period} icon={Activity} className="col-span-2 sm:col-span-1" />
          </div>

          {/* Trend cards grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {result.trends.map((trend, i) => (
              <TrendCard key={i} trend={trend} />
            ))}
          </div>

          {result.isMock && (
            <p className="text-center text-[10px] text-[var(--muted)]">
              ✦ Demo mode — set GEMINI_API_KEY for live AI analysis
            </p>
          )}
        </div>
      )}
    </section>
  );
}

function TrendCard({ trend }: { trend: TrendItem }) {
  const categoryIcons = {
    revenue: TrendingUp,
    volume: BarChart3,
    quality: Zap,
    efficiency: Activity,
    demand: ShoppingBag,
  } as const;

  const directionConfig = {
    up: { icon: TrendingUp, color: 'text-[var(--success)]', bg: 'bg-[var(--success-soft)]', label: 'Trending up' },
    down: { icon: TrendingDown, color: 'text-[var(--danger)]', bg: 'bg-[var(--danger-soft)]', label: 'Trending down' },
    stable: { icon: Minus, color: 'text-[var(--muted)]', bg: 'bg-[var(--surface-2)]', label: 'Stable' },
    concern: { icon: AlertTriangle, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-soft)]', label: 'Needs attention' },
  } as const;

  const Icon = categoryIcons[trend.category] ?? BarChart3;
  const dir = directionConfig[trend.direction];
  const DirIcon = dir.icon;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)]/50 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-[var(--accent-strong)]" />
          <p className="text-sm font-semibold leading-tight text-[var(--foreground)]">
            {trend.title}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
            dir.bg,
            dir.color,
          )}
        >
          <DirIcon className="h-2.5 w-2.5" />
          {dir.label}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">{trend.insight}</p>
      {trend.recommendation && (
        <p className="mt-2 border-t border-[var(--border)] pt-2 text-xs font-medium text-[var(--accent-strong)]">
          → {trend.recommendation}
        </p>
      )}
    </div>
  );
}

function StatPill({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5',
        className,
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-[var(--accent-strong)]" />
      <div>
        <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</p>
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
