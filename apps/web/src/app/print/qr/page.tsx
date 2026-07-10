import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { MOCK_STATION } from '@/lib/mock-data';

export const metadata = { title: 'QR station' };

export default function QrEntryPage() {
  return (
    <ScreenShell
      title="You’re at this station"
      subtitle="Scan confirmed. Confirm the printer, then upload your file to join the queue."
    >
      <div className="flex flex-1 flex-col gap-6">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center justify-center bg-[var(--ink)] px-6 py-10 dark:bg-cyan-300">
            <div
              className="grid grid-cols-5 gap-1.5 rounded-xl bg-[var(--paper)] p-4 text-[var(--ink)] dark:bg-slate-950 dark:text-cyan-300"
              aria-hidden
            >
              {Array.from({ length: 25 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-[2px] sm:h-4 sm:w-4 ${
                    [0, 1, 2, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 21, 22, 24].includes(i)
                      ? 'bg-current'
                      : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-3 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                {MOCK_STATION.name}
              </h2>
              <Badge tone="success">Online</Badge>
            </div>
            <p className="text-sm text-[var(--muted)]">{MOCK_STATION.location}</p>
            <p className="text-sm text-[var(--muted)]">
              Queue now:{' '}
              <span className="font-medium text-[var(--foreground)]">
                {MOCK_STATION.queueLength} jobs
              </span>
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Button href="/print/upload" size="lg" fullWidth>
            Continue to upload
          </Button>
          <Button href="/print/error?kind=printer-offline" variant="secondary" fullWidth>
            Simulate printer offline
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}
