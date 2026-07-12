import { env, resolveStorageDir } from '../../config/env';
import type { FileStorage } from '../../types/upload';
import { LocalFileStorage } from './local-storage.service';

let storageSingleton: FileStorage | undefined;

/**
 * Storage factory — today returns local disk; later can switch on STORAGE_DRIVER=s3|cloudinary.
 *
 * The root directory is resolved via `resolveStorageDir` so serverless
 * deployments (Vercel) fall back to the writable `/tmp` volume instead of the
 * read-only deployment filesystem.
 */
export function getFileStorage(): FileStorage {
  if (!storageSingleton) {
    storageSingleton = new LocalFileStorage(resolveStorageDir(env.uploadDir));
  }
  return storageSingleton;
}
