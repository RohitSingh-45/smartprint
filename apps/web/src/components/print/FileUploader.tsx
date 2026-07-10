'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useId, useRef, useState } from 'react';
import { CheckCircle2, FileUp, Replace, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
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
            'group flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed px-6 py-12 text-center transition-all duration-200',
            'border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-xs)]',
            'hover:border-[var(--accent)]/50 hover:bg-[var(--accent-soft)]/30 hover:shadow-[var(--shadow-sm)]',
            dragActive &&
              'scale-[1.01] border-[var(--accent)] bg-[var(--accent-soft)]/50 shadow-[var(--shadow-md)]',
            status === 'error' && 'border-[var(--danger)]/50',
          )}
          aria-label="Upload file. Drag and drop or click to browse."
        >
          <div
            className={cn(
              'mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface-2)] text-[var(--accent-strong)] transition-transform duration-200',
              'group-hover:scale-105',
              dragActive && 'scale-110 bg-[var(--accent-soft)]',
            )}
          >
            <UploadCloud className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </div>
          <p className="text-[15px] font-medium text-[var(--foreground)]">
            Drop your file here, or click to browse
          </p>
          <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">
            {UPLOAD_ALLOWED_LABEL} · max 25 MB
          </p>
        </div>
      ) : null}

      {status === 'uploading' ? (
        <div
          className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] text-[var(--accent-strong)]">
              <FileUp className="h-4 w-4 animate-pulse" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Uploading {localFile?.name}</p>
              <p className="text-xs text-[var(--muted)]">Keep this tab open until it finishes.</p>
            </div>
            <Badge tone="accent">{progress}%</Badge>
          </div>
          <ProgressBar className="mt-4" value={progress} />
        </div>
      ) : null}

      {status === 'error' && error ? (
        <div
          className="rounded-[var(--radius-xl)] border border-[var(--danger)]/25 bg-[var(--danger-soft)] p-4"
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
              icon={Replace}
            >
              Try another file
            </Button>
          </div>
        </div>
      ) : null}

      {uploaded && status === 'success' ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] animate-rise">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--success-soft)] text-[var(--success)] animate-check-pop">
                <CheckCircle2 className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--success)]">
                  Uploaded
                </p>
                <p className="mt-1 break-all text-sm font-medium">{displayName}</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Badge>{displaySize}</Badge>
                  <Badge tone="neutral">{displayType}</Badge>
                  <Badge tone="accent" dot>
                    ID {uploaded.id.slice(0, 8)}
                  </Badge>
                </div>
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
              icon={Replace}
            >
              Replace file
            </Button>
            <Button
              type="button"
              variant="ghost"
              fullWidth
              onClick={() => void removeFile()}
              disabled={busy}
              icon={Trash2}
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
        PDF uploads open the preview automatically. DOCX/JPG/PNG stay here until conversion lands
        later.
      </p>
    </div>
  );
}
