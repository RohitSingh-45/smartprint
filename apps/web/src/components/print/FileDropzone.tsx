'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

export function FileDropzone() {
  const [active, setActive] = useState(false);

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onDragEnter={(e) => {
          e.preventDefault();
          setActive(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setActive(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setActive((v) => !v);
        }}
        className={cn(
          'flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors',
          'border-[var(--border-strong)] bg-[var(--surface)]',
          active && 'border-[var(--accent)] bg-[var(--accent-soft)]',
        )}
        aria-label="Upload file dropzone placeholder"
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-2)] font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--accent-strong)]">
          ↑
        </div>
        <p className="font-medium text-[var(--foreground)]">Drop PDF, DOCX, or image</p>
        <p className="mt-1 max-w-xs text-sm text-[var(--muted)]">
          UI only for Sprint 2 — tap continue to preview mock pages.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button href="/print/preview" fullWidth size="lg">
          Continue with sample PDF
        </Button>
        <Button href="/print/error?kind=upload-failed" variant="secondary" fullWidth size="lg">
          Simulate upload error
        </Button>
      </div>

      <p className="text-center text-xs text-[var(--muted)]">
        Coming from a QR code?{' '}
        <Link
          href="/print/qr"
          className="underline underline-offset-2 hover:text-[var(--foreground)]"
        >
          Re-scan station
        </Link>
      </p>
    </div>
  );
}
