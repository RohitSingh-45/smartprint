'use client';

import { ShieldCheck, ShieldAlert, Shield, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { fetchOrderRisk, type OrderRiskResult } from '@/lib/ai-api';
import { cn } from '@/lib/cn';

type Props = {
  orderId: string;
  status: string;
  customerName: string;
  amountPaid: number;
  printAttempts?: number;
  lastPrintError?: string | null;
  queuePosition?: number | null;
  totalPages?: number;
  copies?: number;
  colorPages?: number;
  bwPages?: number;
  /** Optional: waiting time in ms from which we compute minutes */
  waitingMs?: number | null;
};

const riskCache = new Map<string, OrderRiskResult>();
const inFlightPromises = new Map<string, Promise<OrderRiskResult>>();

export function OrderRiskBadge({
  orderId,
  status,
  customerName,
  amountPaid,
  printAttempts = 0,
  lastPrintError = null,
  queuePosition = null,
  totalPages = 1,
  copies = 1,
  colorPages = 0,
  bwPages = 0,
  waitingMs = null,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderRiskResult | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const analyze = useCallback(async () => {
    const cacheKey = `${orderId}:${status}:${printAttempts}:${lastPrintError ?? ''}:${queuePosition ?? ''}`;
    if (riskCache.has(cacheKey)) {
      setResult(riskCache.get(cacheKey)!);
      return;
    }

    setLoading(true);
    try {
      let promise = inFlightPromises.get(cacheKey);
      if (!promise) {
        promise = fetchOrderRisk({
          orderId,
          status,
          customerName,
          amountPaid,
          printAttempts,
          lastPrintError,
          queuePosition,
          totalPages,
          copies,
          colorPages,
          bwPages,
          waitingTimeMinutes: waitingMs != null ? Math.round(waitingMs / 60000) : null,
        });
        inFlightPromises.set(cacheKey, promise);
      }
      const risk = await promise;
      riskCache.set(cacheKey, risk);
      setResult(risk);
    } catch {
      // silently fail — risk badge is non-critical
    } finally {
      inFlightPromises.delete(cacheKey);
      setLoading(false);
    }
  }, [orderId, status, customerName, amountPaid, printAttempts, lastPrintError, queuePosition, totalPages, copies, colorPages, bwPages, waitingMs]);

  useEffect(() => {
    // Only analyze if order is in an active / potentially risky state
    const activeStatuses = ['QUEUED', 'HELD', 'READY_FOR_PRINT', 'PRINTING', 'FAILED', 'PAID', 'ACCEPTED'];
    if (activeStatuses.includes(status)) {
      void analyze();
    }
  }, [analyze, status]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
        AI…
      </span>
    );
  }

  if (!result) return null;

  const config = {
    low: {
      icon: ShieldCheck,
      label: 'Low risk',
      className: 'bg-[var(--success-soft)] text-[var(--success)]',
    },
    medium: {
      icon: Shield,
      label: 'Medium risk',
      className: 'bg-[var(--warning-soft)] text-[var(--warning)]',
    },
    high: {
      icon: ShieldAlert,
      label: 'High risk',
      className: 'bg-[var(--danger-soft)] text-[var(--danger)]',
    },
  };

  const c = config[result.riskLevel];
  const Icon = c.icon;

  return (
    <div className="relative inline-block">
      <button
        className={cn(
          'inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-opacity hover:opacity-80',
          c.className,
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`Risk level: ${result.riskLevel}. ${result.reason}`}
      >
        <Icon className="h-2.5 w-2.5" />
        {c.label}
      </button>

      {showTooltip && (
        <div className="absolute bottom-full left-0 z-50 mb-1.5 w-64 animate-fade rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-lg)]">
          <div className="flex items-center gap-1.5">
            <Icon className={cn('h-3.5 w-3.5', result.riskLevel === 'high' ? 'text-[var(--danger)]' : result.riskLevel === 'medium' ? 'text-[var(--warning)]' : 'text-[var(--success)]')} />
            <p className="text-xs font-semibold capitalize">{result.riskLevel} Risk · Score {result.riskScore}/100</p>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">{result.reason}</p>
          {result.suggestedAction && (
            <p className="mt-1.5 text-xs font-medium text-[var(--accent-strong)]">
              → {result.suggestedAction}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
