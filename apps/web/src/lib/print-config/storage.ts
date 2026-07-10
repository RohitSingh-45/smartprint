import { PDF_META_STORAGE_KEY, PRINT_CONFIG_STORAGE_KEY } from './constants';
import type { PrintConfig } from './types';

export type PdfMetaSession = {
  fileId: string;
  pageCount: number;
  fileName: string;
};

export function savePdfMetaSession(meta: PdfMetaSession): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PDF_META_STORAGE_KEY, JSON.stringify(meta));
}

export function readPdfMetaSession(): PdfMetaSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PDF_META_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PdfMetaSession;
  } catch {
    return null;
  }
}

export function savePrintConfigSession(config: PrintConfig): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PRINT_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function readPrintConfigSession(): PrintConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PRINT_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PrintConfig;
  } catch {
    return null;
  }
}

export function clearPrintConfigSession(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(PRINT_CONFIG_STORAGE_KEY);
}
