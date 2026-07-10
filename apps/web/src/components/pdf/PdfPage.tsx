'use client';

import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';
import { cn } from '@/lib/cn';

type Props = {
  document: PDFDocumentProxy;
  pageNumber: number;
  /** Absolute CSS pixel width to fit; scale is derived from page viewport. */
  width: number;
  scale: number;
  className?: string;
};

/**
 * Renders a single PDF page to canvas when it enters the viewport.
 * Ready for future selection overlays (data-page-number).
 */
export function PdfPage({ document, pageNumber, width, scale, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(pageNumber <= 2);
  const [status, setStatus] = useState<'idle' | 'rendering' | 'ready' | 'error'>('idle');
  const [aspect, setAspect] = useState(1.414);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
        }
      },
      { rootMargin: '240px 0px', threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    let renderTask: RenderTask | null = null;
    let page: PDFPageProxy | null = null;

    async function render() {
      setStatus('rendering');
      try {
        page = await document.getPage(pageNumber);
        if (cancelled) return;

        const base = page.getViewport({ scale: 1 });
        setAspect(base.height / base.width);

        const viewport = page.getViewport({ scale: (width / base.width) * scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d', { alpha: false });
        if (!context) return;

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        renderTask = page.render({
          canvasContext: context,
          viewport,
          canvas,
          transform,
        });

        await renderTask.promise;
        if (!cancelled) setStatus('ready');
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : '';
        if (/Rendering cancelled/i.test(message)) return;
        setStatus('error');
      }
    }

    void render();

    return () => {
      cancelled = true;
      renderTask?.cancel();
      page?.cleanup();
    };
  }, [document, pageNumber, width, scale, visible]);

  return (
    <article
      ref={containerRef}
      data-page-number={pageNumber}
      className={cn('mx-auto w-full max-w-full', className)}
      aria-label={`Page ${pageNumber}`}
    >
      <div
        className="relative overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm"
        style={{ aspectRatio: `1 / ${aspect}` }}
      >
        {(status === 'idle' || status === 'rendering') && (
          <div className="absolute inset-0 animate-pulse bg-[var(--surface-2)]" aria-hidden />
        )}
        {status === 'error' ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-[var(--danger)]">
            Could not render page {pageNumber}
          </div>
        ) : (
          <canvas ref={canvasRef} className="mx-auto block max-w-full" />
        )}
      </div>
      <p className="mt-2 text-center text-xs font-medium text-[var(--muted)]">Page {pageNumber}</p>
    </article>
  );
}
