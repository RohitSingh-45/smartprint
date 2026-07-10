import path from 'path';
import { ALLOWED_EXTENSIONS } from '../types/upload';

const UNSAFE_CHARS = /[^a-zA-Z0-9._-]+/g;

/** Strip path segments and normalize to a safe basename. */
export function sanitizeFilename(originalName: string): string {
  const base = path
    .basename(originalName)
    .normalize('NFKC')
    .replace(UNSAFE_CHARS, '_')
    .replace(/_+/g, '_')
    .replace(/^[._]+/, '');

  const trimmed = base.slice(0, 180) || 'file';
  return trimmed;
}

export function getExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return ext;
}

export function isAllowedExtension(ext: string): boolean {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext.toLowerCase());
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
