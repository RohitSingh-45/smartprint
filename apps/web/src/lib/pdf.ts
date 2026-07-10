import type { PDFDocumentProxy } from 'pdfjs-dist';

let workerConfigured = false;

export async function getPdfjs() {
  const pdfjs = await import('pdfjs-dist');
  if (!workerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    workerConfigured = true;
  }
  return pdfjs;
}

export type PdfLoadResult = {
  document: PDFDocumentProxy;
  pageCount: number;
};

export async function loadPdfFromUrl(url: string): Promise<PdfLoadResult> {
  const pdfjs = await getPdfjs();
  const loadingTask = pdfjs.getDocument({
    url,
    // Keep memory lower for large docs; pages render on demand.
    disableAutoFetch: true,
    disableStream: false,
  });

  try {
    const document = await loadingTask.promise;
    return {
      document,
      pageCount: document.numPages,
    };
  } catch (error) {
    const name = error && typeof error === 'object' && 'name' in error ? String(error.name) : '';
    const message = error instanceof Error ? error.message : 'Unable to open PDF.';

    if (name === 'PasswordException' || /password/i.test(message)) {
      throw new Error('This PDF is password-protected and cannot be previewed.');
    }
    if (name === 'InvalidPDFException' || /invalid pdf/i.test(message)) {
      throw new Error('This file is not a valid PDF or is corrupted.');
    }
    if (/empty|no pages/i.test(message)) {
      throw new Error('This PDF has no pages to preview.');
    }
    throw new Error(message || 'Unable to render this PDF.');
  }
}

export const ZOOM_MIN = 0.6;
export const ZOOM_MAX = 2.4;
export const ZOOM_STEP = 0.15;
