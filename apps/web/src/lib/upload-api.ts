export type UploadedFileDto = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  sizeLabel: string;
  extension: string;
  createdAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const UPLOAD_ACCEPT = '.pdf,.docx,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';

export const UPLOAD_ALLOWED_LABEL = 'PDF, DOCX, JPG, PNG';

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function uploadFileWithProgress(
  file: File,
  onProgress: (percent: number) => void,
): Promise<UploadedFileDto> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('file', file);

    xhr.open('POST', `${API_URL}/api/uploads`);
    xhr.responseType = 'json';

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    };

    xhr.onload = () => {
      const body = xhr.response ?? {};
      if (xhr.status >= 200 && xhr.status < 300 && body.file) {
        resolve(body.file as UploadedFileDto);
        return;
      }
      const message =
        (body && typeof body.error === 'string' && body.error) || `Upload failed (${xhr.status})`;
      reject(new Error(message));
    };

    xhr.onerror = () => {
      reject(new Error('Network error while uploading. Is the API running?'));
    };

    xhr.onabort = () => {
      reject(new Error('Upload cancelled.'));
    };

    xhr.send(form);
  });
}

export async function deleteUploadedFile(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/uploads/${id}`, { method: 'DELETE' });
  if (res.status === 204 || res.status === 404) return;
  const body = await res.json().catch(() => ({}));
  throw new Error(
    (body && typeof body.error === 'string' && body.error) || `Delete failed (${res.status})`,
  );
}

export async function fetchUploadedFile(id: string): Promise<UploadedFileDto> {
  const res = await fetch(`${API_URL}/api/uploads/${id}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.file) {
    throw new Error(
      (body && typeof body.error === 'string' && body.error) ||
        `Could not load file (${res.status})`,
    );
  }
  return body.file as UploadedFileDto;
}

export function getUploadContentUrl(id: string): string {
  return `${API_URL}/api/uploads/${id}/content`;
}

export function readUploadSession(): UploadedFileDto | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem('smartprint:upload');
    if (!raw) return null;
    return JSON.parse(raw) as UploadedFileDto;
  } catch {
    return null;
  }
}

export function isPdfUpload(file: UploadedFileDto): boolean {
  return file.mimeType === 'application/pdf' || file.extension === '.pdf';
}
