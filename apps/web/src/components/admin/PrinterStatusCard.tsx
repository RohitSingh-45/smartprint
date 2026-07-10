'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

const STORAGE_KEY = 'smartprint:shop-printer-ui';

type PrinterConnection = 'online' | 'offline' | 'connecting';
type PaperStatus = 'ok' | 'low' | 'empty';
type InkStatus = 'ok' | 'low' | 'empty';

type PrinterUiState = {
  connection: PrinterConnection;
  paper: PaperStatus;
  ink: InkStatus;
  jam: boolean;
  paused: boolean;
};

const DEFAULT_STATE: PrinterUiState = {
  connection: 'offline',
  paper: 'ok',
  ink: 'ok',
  jam: false,
  paused: false,
};

function readState(): PrinterUiState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<PrinterUiState>) };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: PrinterUiState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function labelConnection(value: PrinterConnection): string {
  if (value === 'online') return 'Online';
  if (value === 'connecting') return 'Connecting';
  return 'Offline';
}

export function PrinterStatusCard() {
  const [state, setState] = useState<PrinterUiState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readState());
    setHydrated(true);
  }, []);

  function update(patch: Partial<PrinterUiState>) {
    setState((prev) => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  }

  function cycleConnection() {
    const order: PrinterConnection[] = ['offline', 'connecting', 'online'];
    const idx = order.indexOf(state.connection);
    update({ connection: order[(idx + 1) % order.length] });
  }

  if (!hydrated) {
    return (
      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <p className="text-sm text-[var(--muted)]">Loading printer widget…</p>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
      aria-label="Printer status placeholder"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            Printer status
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Legacy UI toy — live agent status is on{' '}
            <a href="/admin/printers" className="text-[var(--accent-strong)] underline-offset-2 hover:underline">
              Printers
            </a>
            .
          </p>
        </div>
        <Badge
          tone={
            state.connection === 'online'
              ? 'success'
              : state.connection === 'connecting'
                ? 'warning'
                : 'neutral'
          }
        >
          {labelConnection(state.connection)}
        </Badge>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatusRow
          label="Connection"
          value={labelConnection(state.connection)}
          onClick={cycleConnection}
        />
        <StatusRow
          label="Paper"
          value={state.paper.toUpperCase()}
          onClick={() =>
            update({
              paper: state.paper === 'ok' ? 'low' : state.paper === 'low' ? 'empty' : 'ok',
            })
          }
        />
        <StatusRow
          label="Ink"
          value={state.ink.toUpperCase()}
          onClick={() =>
            update({
              ink: state.ink === 'ok' ? 'low' : state.ink === 'low' ? 'empty' : 'ok',
            })
          }
        />
        <StatusRow
          label="Paper jam"
          value={state.jam ? 'Detected' : 'Clear'}
          danger={state.jam}
          onClick={() => update({ jam: !state.jam })}
        />
      </dl>

      <div
        className={cn(
          'mt-4 rounded-lg border px-3 py-2 text-sm',
          state.paused
            ? 'border-[var(--warning)]/40 bg-[var(--warning-soft)]'
            : 'border-[var(--border)] bg-[var(--surface-2)]',
        )}
      >
        Order intake: <strong>{state.paused ? 'Paused' : 'Accepting'}</strong>
        <span className="text-[var(--muted)]"> (UI state only)</span>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          variant="secondary"
          fullWidth
          disabled={state.paused}
          onClick={() => update({ paused: true })}
        >
          Pause orders
        </Button>
        <Button fullWidth disabled={!state.paused} onClick={() => update({ paused: false })}>
          Resume orders
        </Button>
      </div>
    </section>
  );
}

function StatusRow({
  label,
  value,
  danger,
  onClick,
}: {
  label: string;
  value: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-left transition-colors hover:border-[var(--border-strong)]"
    >
      <dt className="text-xs text-[var(--muted)]">{label}</dt>
      <dd className={cn('mt-1 text-sm font-medium', danger && 'text-[var(--danger)]')}>{value}</dd>
    </button>
  );
}
