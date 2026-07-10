'use client';

import { QRCodeSVG } from 'qrcode.react';
import { PackageCheck } from 'lucide-react';
import { formatTrackingTime } from '@/lib/tracking/tracking-api';
import type { CustomerTrackingView } from '@/lib/tracking/types';

type Props = {
  tracking: CustomerTrackingView;
  origin: string;
};

export function PickupQrCard({ tracking, origin }: Props) {
  const { pickup, customerStatus } = tracking;
  if (!pickup.ready && customerStatus !== 'COLLECTED' && customerStatus !== 'EXPIRED_PICKUP') {
    return null;
  }

  const collectUrl =
    pickup.collectPath && origin
      ? `${origin}${pickup.collectPath}`
      : pickup.token && origin
        ? `${origin}/admin/pickup/${pickup.token}`
        : null;

  if (customerStatus === 'COLLECTED') {
    return (
      <section
        aria-label="Pickup complete"
        className="rounded-[var(--radius-xl)] border border-[var(--success)]/25 bg-[var(--success-soft)] p-6 text-center"
      >
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--success)] animate-check-pop">
          <PackageCheck className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="text-label text-[var(--success)]">Collected</p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[0.12em]">
          {pickup.code ?? '—'}
        </p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Handed over {formatTrackingTime(pickup.collectedAt)}
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Pickup QR code"
      className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-[var(--shadow-sm)] animate-rise"
    >
      <p className="text-label text-[var(--accent-strong)]">Ready for pickup</p>
      <p className="mt-2 text-sm text-[var(--muted)]">Show this code or QR at the counter</p>
      <p className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[0.18em]">
        {pickup.code ?? '—'}
      </p>
      {collectUrl && pickup.token ? (
        <div className="mx-auto mt-6 inline-flex rounded-[var(--radius-lg)] bg-white p-3.5 shadow-[var(--shadow-sm)] dark:bg-white">
          <QRCodeSVG
            value={collectUrl}
            size={168}
            level="M"
            marginSize={1}
            title="Pickup QR code for shop scan"
          />
        </div>
      ) : null}
      <p className="mt-4 text-xs text-[var(--muted)]">
        Shop staff scan this QR to mark your order collected.
      </p>
    </section>
  );
}
