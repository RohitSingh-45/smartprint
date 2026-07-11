import { randomUUID } from 'crypto';
import { env } from '../../config/env';
import { getUpload } from '../upload.service';
import type { DraftInput, DraftOrder, DraftPublic } from '../../types/draft';
import { getDraftStore } from './index';
import { DraftValidationError } from './draft.validation';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function assertDraftId(id: string): void {
  if (!isUuid(id)) {
    throw new DraftValidationError('Invalid draft id.', 400, 'INVALID_ID');
  }
}

export function isExpired(draft: DraftOrder, now = Date.now()): boolean {
  return new Date(draft.expiresAt).getTime() <= now || draft.status === 'expired';
}

export function toPublicDraft(draft: DraftOrder, now = Date.now()): DraftPublic {
  const expiresMs = new Date(draft.expiresAt).getTime();
  const secondsRemaining = Math.max(0, Math.floor((expiresMs - now) / 1000));
  const expired = isExpired(draft, now);

  return {
    ...draft,
    status: expired && draft.status !== 'deleted' ? 'expired' : draft.status,
    secondsRemaining,
    isExpired: expired,
  };
}

async function assertUploadForDraft(uploadId: string): Promise<{
  originalName: string;
  size: number;
}> {
  const upload = await getUpload(uploadId);
  if (!upload) {
    throw new DraftValidationError('Upload not found for this draft.', 400, 'UPLOAD_MISSING');
  }
  if (upload.mimeType !== 'application/pdf' || upload.extension !== '.pdf') {
    throw new DraftValidationError(
      'Only PDF uploads can be drafted for printing.',
      415,
      'DRAFT_PDF_ONLY',
    );
  }
  return { originalName: upload.originalName, size: upload.size };
}

async function markExpiredIfNeeded(draft: DraftOrder): Promise<DraftOrder> {
  if (draft.status === 'deleted') return draft;
  if (!isExpired(draft) || draft.status === 'expired') return draft;

  const next: DraftOrder = {
    ...draft,
    status: 'expired',
    updatedAt: new Date().toISOString(),
  };
  await getDraftStore().save(next);
  return next;
}

export async function createDraft(input: DraftInput): Promise<DraftPublic> {
  const upload = await assertUploadForDraft(input.uploadId);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.draftTtlSeconds * 1000);

  const draft: DraftOrder = {
    id: randomUUID(),
    ...input,
    // Never trust client file metadata — bind to stored upload.
    fileName: upload.originalName.slice(0, 180),
    fileSize: upload.size,
    status: 'created',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  await getDraftStore().save(draft);
  return toPublicDraft(draft);
}

export async function getDraft(id: string): Promise<DraftPublic> {
  assertDraftId(id);
  const existing = await getDraftStore().get(id);
  if (!existing || existing.status === 'deleted') {
    throw new DraftValidationError('Draft not found.', 404, 'DRAFT_NOT_FOUND');
  }

  const draft = await markExpiredIfNeeded(existing);
  const pub = toPublicDraft(draft);

  if (pub.isExpired) {
    throw new DraftValidationError('Draft has expired.', 410, 'DRAFT_EXPIRED');
  }

  return pub;
}

export async function updateDraft(id: string, input: DraftInput): Promise<DraftPublic> {
  assertDraftId(id);
  const existing = await getDraftStore().get(id);
  if (!existing || existing.status === 'deleted') {
    throw new DraftValidationError('Draft not found.', 404, 'DRAFT_NOT_FOUND');
  }

  const current = await markExpiredIfNeeded(existing);
  if (isExpired(current)) {
    throw new DraftValidationError('Draft has expired.', 410, 'DRAFT_EXPIRED');
  }

  if (input.uploadId !== current.uploadId) {
    throw new DraftValidationError(
      'uploadId cannot change for an existing draft.',
      400,
      'UPLOAD_IMMUTABLE',
    );
  }

  const upload = await assertUploadForDraft(input.uploadId);

  const next: DraftOrder = {
    ...current,
    ...input,
    id: current.id,
    fileName: upload.originalName.slice(0, 180),
    fileSize: upload.size,
    status: 'updated',
    createdAt: current.createdAt,
    expiresAt: current.expiresAt,
    updatedAt: new Date().toISOString(),
  };

  await getDraftStore().save(next);
  return toPublicDraft(next);
}

export async function deleteDraft(id: string): Promise<void> {
  assertDraftId(id);
  const existing = await getDraftStore().get(id);
  if (!existing || existing.status === 'deleted') {
    throw new DraftValidationError('Draft not found.', 404, 'DRAFT_NOT_FOUND');
  }

  const next: DraftOrder = {
    ...existing,
    status: 'deleted',
    updatedAt: new Date().toISOString(),
  };
  await getDraftStore().save(next);
}
