'use client';

import { Badge } from '@/components/ui/Badge';
import { statusLabel } from '@/lib/shop/shop-api';
import type { OrderStatus } from '@/lib/shop/types';

const toneByStatus: Record<
  OrderStatus,
  'neutral' | 'accent' | 'success' | 'warning' | 'danger'
> = {
  PAID: 'accent',
  ACCEPTED: 'warning',
  QUEUED: 'accent',
  HELD: 'warning',
  READY: 'success',
  READY_FOR_PRINT: 'success',
  PRINTING: 'accent',
  COMPLETED: 'success',
  FAILED: 'danger',
  REJECTED: 'danger',
  CANCELLED: 'danger',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={toneByStatus[status] ?? 'neutral'}>{statusLabel(status)}</Badge>;
}
