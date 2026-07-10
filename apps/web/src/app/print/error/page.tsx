import { ErrorPanel } from '@/components/print/ErrorPanel';
import { ScreenShell } from '@/components/ui/ScreenShell';
import type { ErrorKind } from '@/lib/mock-data';

export const metadata = { title: 'Error' };

type Props = {
  searchParams: Promise<{ kind?: string }>;
};

function resolveKind(value?: string): ErrorKind {
  if (value === 'payment-failed' || value === 'upload-failed' || value === 'printer-offline') {
    return value;
  }
  return 'upload-failed';
}

export default async function ErrorPage({ searchParams }: Props) {
  const params = await searchParams;
  const kind = resolveKind(params.kind);

  return (
    <ScreenShell title="Let’s fix this" subtitle="Recover and get back into the print flow.">
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <a
          className="underline underline-offset-2 text-[var(--muted)]"
          href="/print/error?kind=printer-offline"
        >
          Printer offline
        </a>
        <a
          className="underline underline-offset-2 text-[var(--muted)]"
          href="/print/error?kind=payment-failed"
        >
          Payment failed
        </a>
        <a
          className="underline underline-offset-2 text-[var(--muted)]"
          href="/print/error?kind=upload-failed"
        >
          Upload failed
        </a>
      </div>
      <ErrorPanel kind={kind} />
    </ScreenShell>
  );
}
