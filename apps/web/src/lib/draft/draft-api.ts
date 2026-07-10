import type { PrintConfig, PrintConfigSummary } from '@/lib/print-config/types';
import type { UploadedFileDto } from '@/lib/upload-api';

export type DraftStatus = 'created' | 'updated' | 'expired' | 'deleted';

export type DraftDto = {
  id: string;
  uploadId: string;
  fileName: string;
  fileSize: number;
  totalPages: number;
  colorPages: number[];
  bwPages: number[];
  copies: number;
  pageRange: {
    mode: 'all' | 'custom' | 'odd' | 'even';
    custom: string;
    pages: number[];
  };
  paperSize: 'a4' | 'a3' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  estimatedPrice: number;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  secondsRemaining: number;
  isExpired: boolean;
};

export type DraftPayload = Omit<
  DraftDto,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'expiresAt' | 'secondsRemaining' | 'isExpired'
>;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
export const DRAFT_SESSION_KEY = 'smartprint:draft-id';

export function buildDraftPayload(
  config: PrintConfig,
  summary: PrintConfigSummary,
  upload: UploadedFileDto,
): DraftPayload {
  const colorPages = summary.printablePages.filter((page) => config.pageModes[page] === 'color');
  const bwPages = summary.printablePages.filter(
    (page) => (config.pageModes[page] ?? 'bw') === 'bw',
  );

  return {
    uploadId: upload.id,
    fileName: config.fileName ?? upload.originalName,
    fileSize: upload.size,
    totalPages: config.totalPages,
    colorPages,
    bwPages,
    copies: config.copies,
    pageRange: {
      mode: config.rangeMode,
      custom: config.customRange,
      pages: summary.printablePages,
    },
    paperSize: config.paperSize,
    orientation: config.orientation,
    estimatedPrice: summary.estimatedCost,
  };
}

async function parseDraftResponse(res: Response): Promise<DraftDto> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.draft) {
    const message =
      (body && typeof body.error === 'string' && body.error) ||
      `Draft request failed (${res.status})`;
    const error = new Error(message) as Error & { status?: number; code?: string };
    error.status = res.status;
    error.code = typeof body.code === 'string' ? body.code : undefined;
    throw error;
  }
  return body.draft as DraftDto;
}

export async function createDraft(payload: DraftPayload): Promise<DraftDto> {
  const res = await fetch(`${API_URL}/api/drafts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseDraftResponse(res);
}

export async function getDraft(id: string): Promise<DraftDto> {
  const res = await fetch(`${API_URL}/api/drafts/${id}`);
  return parseDraftResponse(res);
}

export async function updateDraft(id: string, payload: DraftPayload): Promise<DraftDto> {
  const res = await fetch(`${API_URL}/api/drafts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseDraftResponse(res);
}

export async function deleteDraft(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/drafts/${id}`, { method: 'DELETE' });
  if (res.status === 204 || res.status === 404) return;
  const body = await res.json().catch(() => ({}));
  throw new Error(
    (body && typeof body.error === 'string' && body.error) || `Delete draft failed (${res.status})`,
  );
}

export function readDraftIdSession(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(DRAFT_SESSION_KEY);
}

export function saveDraftIdSession(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (!id) {
    window.sessionStorage.removeItem(DRAFT_SESSION_KEY);
    return;
  }
  window.sessionStorage.setItem(DRAFT_SESSION_KEY, id);
}

export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
