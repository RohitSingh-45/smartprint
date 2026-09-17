'use client';

import { useEffect, useMemo, useState } from 'react';
import { OrderHistoryList } from '@/components/tracking/OrderHistoryList';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { readOrderIdSession } from '@/lib/payment/payment-api';
import { readOrderHistory } from '@/lib/tracking/history';
import { getOrderTracking } from '@/lib/tracking/tracking-api';
import type { CustomerTrackingStatus, OrderHistoryEntry } from '@/lib/tracking/types';

export default function OrderHistoryPage() {
  const [entries, setEntries] = useState<OrderHistoryEntry[]>([]);
  const [statusById, setStatusById] = useState<Record<string, CustomerTrackingStatus | string>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    setSessionId(readOrderIdSession());
    const list = readOrderHistory();
    setEntries(list);

    void (async () => {
      const next: Record<string, CustomerTrackingStatus | string> = {};
      await Promise.all(
        list.slice(0, 12).map(async (item) => {
          try {
            const tracking = await getOrderTracking(item.id);
            next[item.id] = tracking.customerStatus;
          } catch {
            /* ignore missing / expired local history entries */
          }
        }),
      );
      setStatusById(next);
    })();
  }, []);

  const currentIds = useMemo(() => {
    const set = new Set<string>();
    if (sessionId) set.add(sessionId);
    return set;
  }, [sessionId]);

  return (
    <ScreenShell
      title="Your orders"
      subtitle="Orders saved on this device. Receipt and reprint stay disabled for now."
    >
      <div className="space-y-6">
        <OrderHistoryList entries={entries} currentIds={currentIds} statusById={statusById} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/print/status" size="lg" fullWidth>
            Track current order
          </Button>
          <Button href="/print/qr" variant="secondary" fullWidth>
            Start a new print
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}
