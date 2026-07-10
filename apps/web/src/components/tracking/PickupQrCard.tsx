'use client';

import { QRCodeSVG } from 'qrcode.react';
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
        className="rounded-xl border border-[var(--success)]/30 bg-[var(--success-soft)] p-5 text-center"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--success)]">
          Collected
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
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
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center animate-rise"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-strong)]">
        Ready for pickup
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">Show this code or QR at the counter</p>
      <p className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[0.18em]">
        {pickup.code ?? '—'}
      </p>
      {collectUrl && pickup.token ? (
        <div className="mx-auto mt-6 inline-flex rounded-xl bg-white p-3 shadow-sm dark:bg-white">
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
