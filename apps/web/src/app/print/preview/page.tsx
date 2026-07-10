'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { PdfViewer } from '@/components/pdf/PdfViewer';
import { PdfSkeleton } from '@/components/pdf/PdfSkeleton';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { readUploadSession } from '@/lib/upload-api';

function PreviewContent() {
  const params = useSearchParams();
  const queryId = params.get('fileId');
  const session = readUploadSession();
  const fileId = queryId || session?.id || null;

  if (!fileId) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">No PDF selected</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Upload a PDF first. Preview opens automatically after a successful PDF upload.
        </p>
        <div className="mt-5">
          <Button href="/print/upload" size="lg" fullWidth>
            Go to upload
          </Button>
        </div>
      </div>
    );
  }

  return <PdfViewer fileId={fileId} />;
}

export default function PreviewPage() {
  return (
    <ScreenShell
      title="PDF preview"
      subtitle="Review every page before print settings. Zoom and scroll freely — selection comes next."
    >
      <Suspense
        fallback={
          <div>
            <PdfSkeleton />
          </div>
        }
      >
        <PreviewContent />
      </Suspense>
    </ScreenShell>
  );
}
