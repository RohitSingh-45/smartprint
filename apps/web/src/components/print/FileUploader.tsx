'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import {
  UPLOAD_ACCEPT,
  UPLOAD_ALLOWED_LABEL,
  deleteUploadedFile,
  formatBytes,
  isPdfUpload,
  uploadFileWithProgress,
  type UploadedFileDto,
} from '@/lib/upload-api';

type Status = 'idle' | 'uploading' | 'success' | 'error';

const CLIENT_MAX_BYTES = 25 * 1024 * 1024;
const ALLOWED_EXT = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];

function clientValidate(file: File): string | null {
  const name = file.name.toLowerCase();
  const okExt = ALLOWED_EXT.some((ext) => name.endsWith(ext));
  if (!okExt) {
    return `Unsupported file type. Allowed: ${UPLOAD_ALLOWED_LABEL}.`;
  }
  if (file.size <= 0) {
    return 'Empty files are not allowed.';
  }
  if (file.size > CLIENT_MAX_BYTES) {
    return 'File exceeds the 25 MB limit.';
  }
  return null;
}

export function FileUploader() {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState<UploadedFileDto | null>(null);
  const [busy, setBusy] = useState(false);

  const resetInput = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  const persistSession = (file: UploadedFileDto | null) => {
    if (typeof window === 'undefined') return;
    if (!file) {
      window.sessionStorage.removeItem('smartprint:upload');
      return;
    }
    window.sessionStorage.setItem('smartprint:upload', JSON.stringify(file));
  };

  const startUpload = useCallback(
    async (file: File, previousId?: string) => {
      const validationError = clientValidate(file);
      if (validationError) {
        setLocalFile(file);
        setUploaded(null);
        setStatus('error');
        setError(validationError);
        setProgress(0);
        return;
      }

      setLocalFile(file);
      setUploaded(null);
      setError(null);
      setStatus('uploading');
      setProgress(0);
      setBusy(true);

      try {
        if (previousId) {
          await deleteUploadedFile(previousId).catch(() => undefined);
        }
        const result = await uploadFileWithProgress(file, setProgress);
        setUploaded(result);
        setStatus('success');
        persistSession(result);

        if (isPdfUpload(result)) {
          router.push(`/print/preview?fileId=${encodeURIComponent(result.id)}`);
          return;
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Upload failed.');
        persistSession(null);
      } finally {
        setBusy(false);
        resetInput();
      }
    },
    [router],
  );

  const onFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || busy) return;
    void startUpload(file, uploaded?.id);
  };

  const removeFile = async () => {
    setBusy(true);
    setError(null);
    try {
      if (uploaded?.id) {
        await deleteUploadedFile(uploaded.id);
      }
      setUploaded(null);
      setLocalFile(null);
      setStatus('idle');
      setProgress(0);
      persistSession(null);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Could not remove file.');
    } finally {
      setBusy(false);
      resetInput();
    }
  };

  const openPicker = () => {
    if (busy) return;
    inputRef.current?.click();
  };

  const displayName = uploaded?.originalName ?? localFile?.name;
  const displaySize = uploaded?.sizeLabel ?? (localFile ? formatBytes(localFile.size) : null);
  const displayType = uploaded?.mimeType ?? localFile?.type ?? (localFile ? 'unknown' : null);

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={UPLOAD_ACCEPT}
        onChange={(e) => onFiles(e.target.files)}
      />

      {!uploaded && status !== 'uploading' ? (
        <div
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            onFiles(e.dataTransfer.files);
          }}
          className={cn(
            'flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors',
            'border-[var(--border-strong)] bg-[var(--surface)]',
            dragActive && 'border-[var(--accent)] bg-[var(--accent-soft)]',
            status === 'error' && 'border-[var(--danger)]/50',
          )}
          aria-label="Upload file. Drag and drop or click to browse."
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-2)] font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--accent-strong)]">
            ↑
          </div>
          <p className="font-medium text-[var(--foreground)]">Drop file here or click to browse</p>
          <p className="mt-1 max-w-xs text-sm text-[var(--muted)]">
            {UPLOAD_ALLOWED_LABEL} · max 25 MB
          </p>
        </div>
      ) : null}

      {status === 'uploading' ? (
        <div
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Uploading {localFile?.name}</p>
            <Badge tone="accent">{progress}%</Badge>
          </div>
          <div
            className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Keep this tab open until the upload finishes.
          </p>
        </div>
      ) : null}

      {status === 'error' && error ? (
        <div
          className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-4"
          role="alert"
        >
          <p className="text-sm font-semibold text-[var(--danger)]">Upload failed</p>
          <p className="mt-1 text-sm text-[var(--foreground)]/85">{error}</p>
          <div className="mt-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={openPicker}
              disabled={busy}
            >
              Try another file
            </Button>
          </div>
        </div>
      ) : null}

      {uploaded && status === 'success' ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 animate-rise">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--success)]">
                Uploaded
              </p>
              <p className="mt-1 break-all text-sm font-medium">{displayName}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge>{displaySize}</Badge>
                <Badge tone="neutral">{displayType}</Badge>
                <Badge tone="accent">ID {uploaded.id.slice(0, 8)}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={openPicker}
              disabled={busy}
            >
              Replace file
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => void removeFile()}
              disabled={busy}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        {uploaded && isPdfUpload(uploaded) ? (
          <Button
            href={`/print/preview?fileId=${encodeURIComponent(uploaded.id)}`}
            fullWidth
            size="lg"
          >
            Open PDF preview
          </Button>
        ) : (
          <Button href="/print/preview" fullWidth size="lg" disabled>
            PDF preview (upload a PDF)
          </Button>
        )}
      </div>

      <p className="text-center text-xs text-[var(--muted)]">
        PDF uploads open the preview automatically. DOCX/JPG/PNG stay here until conversion lands later.
      </p>
    </div>
  );
}
