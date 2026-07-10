import { StatusTimeline } from '@/components/print/StatusTimeline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { MOCK_ORDER, MOCK_STATION } from '@/lib/mock-data';

export const metadata = { title: 'Order status' };

export default function StatusPage() {
  return (
    <ScreenShell
      title="You’re in the queue"
      subtitle="Track the job from payment to pickup. Dummy status for the demo."
    >
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge tone="accent">Order {MOCK_ORDER.id}</Badge>
        <Badge tone="warning">ETA ~{MOCK_ORDER.etaMinutes} min</Badge>
      </div>

      <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <p className="font-medium">{MOCK_STATION.name}</p>
        <p className="mt-1 text-[var(--muted)]">
          Pickup code{' '}
          <span className="font-semibold text-[var(--foreground)]">{MOCK_ORDER.pickupCode}</span> ·{' '}
          {MOCK_ORDER.paper}
        </p>
      </div>

      <StatusTimeline />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/print/complete" size="lg" fullWidth>
          Simulate print ready
        </Button>
        <Button href="/print/error?kind=printer-offline" variant="secondary" fullWidth>
          Printer went offline
        </Button>
      </div>
    </ScreenShell>
  );
}
