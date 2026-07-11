'use client';

import { MapPin, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { DEFAULT_STATION } from '@/lib/mock-data';

export default function QrEntryPage() {
  return (
    <ScreenShell
      eyebrow="Station confirmed"
      title="You’re at this station"
      subtitle="Confirm the printer below, then upload your file to join the queue."
    >
      <div className="flex flex-1 flex-col gap-6">
        <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
          <div className="relative flex items-center justify-center bg-[var(--surface-2)] px-6 py-12">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  'radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 55%)',
              }}
              aria-hidden
            />
            <div className="relative flex h-28 w-28 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
              <div className="grid grid-cols-3 gap-1.5 p-4" aria-hidden>
                {Array.from({ length: 9 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-5 w-5 rounded-[3px] ${
                      i % 2 === 0
                        ? 'bg-[var(--foreground)]'
                        : 'border border-[var(--border-strong)] bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
                {DEFAULT_STATION.name}
              </h2>
              <Badge tone="success" dot>
                Online
              </Badge>
            </div>
            <p className="flex items-start gap-2 text-sm text-[var(--muted)]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              {DEFAULT_STATION.location}
            </p>
            <div className="grid grid-cols-2 gap-3 rounded-[var(--radius-md)] bg-[var(--surface-2)]/80 px-3 py-3 text-sm">
              <div>
                <p className="text-xs text-[var(--muted)]">Queue</p>
                <p className="mt-0.5 font-semibold tabular-nums">
                  {DEFAULT_STATION.queueLength} jobs
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">Est. wait</p>
                <p className="mt-0.5 font-semibold tabular-nums">
                  ~{DEFAULT_STATION.queueLength * 3} min
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <Button href="/print/upload" size="lg" fullWidth icon={Upload}>
            Continue to upload
          </Button>
        </div>
      </div>
    </ScreenShell>
  );
}
