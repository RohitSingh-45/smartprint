import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { MOCK_ORDER, MOCK_STATION } from '@/lib/mock-data';

export const metadata = { title: 'Ready to collect' };

export default function CompletePage() {
  return (
    <ScreenShell
      title="Ready for pickup"
      subtitle="Show this code at the counter. Your pages are waiting."
    >
      <div className="flex flex-1 flex-col items-center text-center">
        <Badge tone="success" className="mb-6">
          Print complete
        </Badge>

        <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-10 animate-rise">
          <p className="text-sm text-[var(--muted)]">Pickup code</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-5xl font-semibold tracking-[0.2em]">
            {MOCK_ORDER.pickupCode}
          </p>
          <p className="mt-6 text-sm text-[var(--muted)]">{MOCK_STATION.name}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Order {MOCK_ORDER.id}</p>
        </div>

        <div className="mt-auto w-full space-y-3 pt-10">
          <Button href="/" size="lg" fullWidth>
            Back to home
          </Button>
          <Button href="/print/qr" variant="secondary" fullWidth>
            Print another file
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}
