import { promises as fs } from 'fs';
import path from 'path';
import type { FileStorage, StorageSaveInput, UploadedFileMetadata } from '../../types/upload';

/**
 * Local disk storage for Sprint 3.
 * Swap this implementation for S3/Cloudinary later without changing controllers.
 */
export class LocalFileStorage implements FileStorage {
  constructor(private readonly rootDir: string) {}

  async ensureReady(): Promise<void> {
    await fs.mkdir(this.rootDir, { recursive: true });
  }

  private metaPath(id: string): string {
    return path.join(this.rootDir, `${id}.meta.json`);
  }

  private filePath(storedName: string): string {
    return path.join(this.rootDir, storedName);
  }

  async save(input: StorageSaveInput): Promise<UploadedFileMetadata> {
    await this.ensureReady();
    await fs.writeFile(this.filePath(input.storedName), input.buffer);
    await fs.writeFile(this.metaPath(input.id), JSON.stringify(input.metadata, null, 2), 'utf8');
    return input.metadata;
  }

  async getMetadata(id: string): Promise<UploadedFileMetadata | null> {
    try {
      const raw = await fs.readFile(this.metaPath(id), 'utf8');
      return JSON.parse(raw) as UploadedFileMetadata;
    } catch {
      return null;
    }
  }

  resolvePath(storedName: string): string {
    return this.filePath(storedName);
  }

  async readFile(storedName: string): Promise<Buffer> {
    return fs.readFile(this.filePath(storedName));
  }

  async delete(id: string): Promise<boolean> {
    const metadata = await this.getMetadata(id);
    if (!metadata) {
      return false;
    }

    await Promise.allSettled([
      fs.unlink(this.filePath(metadata.storedName)),
      fs.unlink(this.metaPath(id)),
    ]);

    return true;
  }
}
