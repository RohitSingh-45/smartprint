/** v1.0 print workflow requires PDF end-to-end (preview → agent spooler). */
export const ALLOWED_MIME_TYPES = ['application/pdf'] as const;

export const ALLOWED_EXTENSIONS = ['.pdf'] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export type UploadedFileMetadata = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: AllowedMimeType;
  size: number;
  extension: string;
  createdAt: string;
};

export type StorageSaveInput = {
  id: string;
  buffer: Buffer;
  storedName: string;
  metadata: UploadedFileMetadata;
};

export type FileStorage = {
  ensureReady(): Promise<void>;
  save(input: StorageSaveInput): Promise<UploadedFileMetadata>;
  getMetadata(id: string): Promise<UploadedFileMetadata | null>;
  /** Absolute path to the stored binary (local driver). */
  resolvePath(storedName: string): string;
  readFile(storedName: string): Promise<Buffer>;
  delete(id: string): Promise<boolean>;
};
