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
    <ScreenShell
      title="Something went wrong"
      subtitle="Recover and get back into the print flow."
      compact
    >
      <ErrorPanel kind={kind} />
    </ScreenShell>
  );
}
