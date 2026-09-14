'use client';

import { BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TrendAnalysisPanel } from '@/components/ai/TrendAnalysisPanel';
import { Button } from '@/components/ui/Button';

export default function AdminTrendsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Overview
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--accent)] to-purple-600 text-white shadow-[var(--shadow-sm)]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
                Trends & Business Intelligence
              </h1>
              <p className="text-[14px] text-[var(--muted)]">
                AI-driven analysis over full order history to optimize campus printing operations
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button href="/admin/orders" variant="secondary">
            View All Orders
          </Button>
          <Button href="/admin/queue">
            Inspect Queue
          </Button>
        </div>
      </div>

      {/* RAG Trend Analysis Panel */}
      <TrendAnalysisPanel />
    </div>
  );
}
