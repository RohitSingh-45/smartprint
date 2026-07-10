import path from 'path';
import { env } from '../../config/env';
import type { FileStorage } from '../../types/upload';
import { LocalFileStorage } from './local-storage.service';

let storageSingleton: FileStorage | undefined;

/**
 * Storage factory — today returns local disk; later can switch on STORAGE_DRIVER=s3|cloudinary.
 */
export function getFileStorage(): FileStorage {
  if (!storageSingleton) {
    const rootDir = path.isAbsolute(env.uploadDir)
      ? env.uploadDir
      : path.resolve(process.cwd(), env.uploadDir);
    storageSingleton = new LocalFileStorage(rootDir);
  }
  return storageSingleton;
}
