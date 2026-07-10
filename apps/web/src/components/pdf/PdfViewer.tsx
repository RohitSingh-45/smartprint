'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { PdfPage } from '@/components/pdf/PdfPage';
import { PdfSkeleton } from '@/components/pdf/PdfSkeleton';
import { PdfToolbar } from '@/components/pdf/PdfToolbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { loadPdfFromUrl, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '@/lib/pdf';
import { fetchUploadedFile, getUploadContentUrl, type UploadedFileDto } from '@/lib/upload-api';

type Props = {
  fileId: string;
};

type ViewerState =
  | { status: 'loading' }
  | { status: 'ready'; file: UploadedFileDto; document: PDFDocumentProxy; pageCount: number }
  | { status: 'error'; message: string; file?: UploadedFileDto };

export function PdfViewer({ fileId }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ViewerState>({ status: 'loading' });
  const [scale, setScale] = useState(1);
  const [fitWidth, setFitWidth] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(640);

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;

    const update = () => {
      const next = Math.max(280, Math.floor(node.clientWidth - 8));
      setViewportWidth(next);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadedDoc: PDFDocumentProxy | null = null;

    async function boot() {
      setState({ status: 'loading' });
      try {
        const file = await fetchUploadedFile(fileId);
        if (file.mimeType !== 'application/pdf') {
          throw new Error('Preview is only available for PDF files.');
        }

        const { document, pageCount } = await loadPdfFromUrl(getUploadContentUrl(fileId));
        if (cancelled) {
          await document.cleanup();
          return;
        }

        if (!pageCount) {
          await document.cleanup();
          throw new Error('This PDF has no pages to preview.');
        }

        loadedDoc = document;
        setState({ status: 'ready', file, document, pageCount });
      } catch (error) {
        if (cancelled) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to preview this PDF.',
        });
      }
    }

    void boot();

    return () => {
      cancelled = true;
      void loadedDoc?.cleanup();
    };
  }, [fileId]);

  const pageWidth = useMemo(() => {
    if (fitWidth) return viewportWidth;
    return Math.floor(viewportWidth * scale);
  }, [fitWidth, viewportWidth, scale]);

  const effectiveScale = fitWidth ? 1 : scale;

  const zoomIn = useCallback(() => {
    setFitWidth(false);
    setScale((value) => Math.min(ZOOM_MAX, Number((value + ZOOM_STEP).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setFitWidth(false);
    setScale((value) => Math.max(ZOOM_MIN, Number((value - ZOOM_STEP).toFixed(2))));
  }, []);

  const onFitWidth = useCallback(() => {
    setFitWidth(true);
    setScale(1);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        zoomIn();
      }
      if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        zoomOut();
      }
      if (event.key.toLowerCase() === '0') {
        event.preventDefault();
        onFitWidth();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [zoomIn, zoomOut, onFitWidth]);

  if (state.status === 'loading') {
    return (
      <div ref={scrollerRef}>
        <PdfToolbar
          scale={scale}
          fitWidth={fitWidth}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onFitWidth={onFitWidth}
          disabled
        />
        <PdfSkeleton />
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-5" role="alert">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--danger)]">
          Preview unavailable
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold">
          Could not render PDF
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/85">{state.message}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button href="/print/upload" size="lg" fullWidth>
            Upload another file
          </Button>
          <Button href="/print/qr" variant="secondary" fullWidth>
            Back to station
          </Button>
        </div>
      </div>
    );
  }

  const { file, document, pageCount } = state;

  return (
    <div ref={scrollerRef} className="flex flex-col">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="accent" className="max-w-full truncate">
          {file.originalName}
        </Badge>
        <Badge>{pageCount} pages</Badge>
        <Badge>{file.sizeLabel}</Badge>
      </div>

      <PdfToolbar
        scale={fitWidth ? 1 : scale}
        fitWidth={fitWidth}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitWidth={onFitWidth}
      />

      <div className="space-y-8 pb-4" aria-label="PDF pages">
        {Array.from({ length: pageCount }, (_, index) => {
          const pageNumber = index + 1;
          return (
            <PdfPage
              key={`${fileId}-${pageNumber}`}
              document={document}
              pageNumber={pageNumber}
              width={pageWidth}
              scale={effectiveScale}
            />
          );
        })}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button href="/print/upload" variant="secondary" fullWidth>
          Replace file
        </Button>
        <Button href="/print/select" size="lg" fullWidth>
          Continue to page selection
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-[var(--muted)]">
        Page selection arrives in the next sprint — preview only for now.
      </p>
    </div>
  );
}
