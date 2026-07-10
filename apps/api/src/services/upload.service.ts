import { randomUUID } from 'crypto';
import { env } from '../config/env';
import { getFileStorage } from './storage';
import {
  ALLOWED_MIME_TYPES,
  type AllowedMimeType,
  type UploadedFileMetadata,
} from '../types/upload';
import { getExtension, isAllowedExtension, sanitizeFilename } from '../utils/filename';

export class UploadValidationError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = 'UPLOAD_INVALID') {
    super(message);
    this.name = 'UploadValidationError';
    this.status = status;
    this.code = code;
  }
}

function assertAllowedFile(originalName: string, mimeType: string, size: number): AllowedMimeType {
  if (!size || size <= 0) {
    throw new UploadValidationError('Empty files are not allowed.', 400, 'FILE_EMPTY');
  }

  if (size > env.uploadMaxBytes) {
    throw new UploadValidationError(
      `File exceeds the maximum size of ${Math.floor(env.uploadMaxBytes / (1024 * 1024))} MB.`,
      413,
      'FILE_TOO_LARGE',
    );
  }

  const extension = getExtension(originalName);
  if (!isAllowedExtension(extension)) {
    throw new UploadValidationError(
      'Unsupported file type. Allowed: PDF, DOCX, JPG, PNG.',
      415,
      'FILE_TYPE_UNSUPPORTED',
    );
  }

  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType)) {
    throw new UploadValidationError(
      'Unsupported media type. Allowed: PDF, DOCX, JPG, PNG.',
      415,
      'MIME_TYPE_UNSUPPORTED',
    );
  }

  // Extension ↔ MIME consistency (basic spoofing guard)
  const mime = mimeType as AllowedMimeType;
  const ok =
    (mime === 'application/pdf' && extension === '.pdf') ||
    (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
      extension === '.docx') ||
    (mime === 'image/jpeg' && (extension === '.jpg' || extension === '.jpeg')) ||
    (mime === 'image/png' && extension === '.png');

  if (!ok) {
    throw new UploadValidationError(
      'File extension does not match its content type.',
      415,
      'TYPE_MISMATCH',
    );
  }

  return mime;
}

export async function createUpload(input: {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}): Promise<UploadedFileMetadata> {
  const mimeType = assertAllowedFile(input.originalName, input.mimeType, input.size);
  const extension = getExtension(input.originalName);
  const id = randomUUID();
  const safeOriginal = sanitizeFilename(input.originalName);
  const storedName = `${id}${extension}`;

  const metadata: UploadedFileMetadata = {
    id,
    originalName: safeOriginal,
    storedName,
    mimeType,
    size: input.size,
    extension,
    createdAt: new Date().toISOString(),
  };

  const storage = getFileStorage();
  return storage.save({
    id,
    buffer: input.buffer,
    storedName,
    metadata,
  });
}

export async function getUpload(id: string): Promise<UploadedFileMetadata | null> {
  if (!isUuid(id)) {
    throw new UploadValidationError('Invalid file id.', 400, 'INVALID_ID');
  }
  return getFileStorage().getMetadata(id);
}

export type UploadContent = {
  metadata: UploadedFileMetadata;
  buffer: Buffer;
};

/**
 * Load binary content for preview. PDF-only for Sprint 4.
 * Validates MIME, extension, and %PDF magic header.
 */
export async function getUploadPdfContent(id: string): Promise<UploadContent> {
  const metadata = await getUpload(id);
  if (!metadata) {
    throw new UploadValidationError('File not found.', 404, 'FILE_NOT_FOUND');
  }

  if (metadata.mimeType !== 'application/pdf' || metadata.extension !== '.pdf') {
    throw new UploadValidationError(
      'Preview is only available for PDF files.',
      415,
      'PREVIEW_PDF_ONLY',
    );
  }

  const storage = getFileStorage();
  let buffer: Buffer;
  try {
    buffer = await storage.readFile(metadata.storedName);
  } catch {
    throw new UploadValidationError('Stored file is missing.', 404, 'FILE_MISSING_ON_DISK');
  }

  if (!buffer.length) {
    throw new UploadValidationError('PDF file is empty.', 422, 'PDF_EMPTY');
  }

  const header = buffer.subarray(0, 5).toString('utf8');
  if (!header.startsWith('%PDF-')) {
    throw new UploadValidationError('File is not a valid PDF.', 422, 'PDF_INVALID_HEADER');
  }

  return { metadata, buffer };
}

export async function deleteUpload(id: string): Promise<boolean> {
  if (!isUuid(id)) {
    throw new UploadValidationError('Invalid file id.', 400, 'INVALID_ID');
  }
  return getFileStorage().delete(id);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
