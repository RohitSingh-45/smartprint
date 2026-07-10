import path from 'path';
import { env } from '../../config/env';
import { LocalDraftStore } from './draft.store';

let store: LocalDraftStore | undefined;

export function getDraftStore(): LocalDraftStore {
  if (!store) {
    const rootDir = path.isAbsolute(env.draftDir)
      ? env.draftDir
      : path.resolve(process.cwd(), env.draftDir);
    store = new LocalDraftStore(rootDir);
  }
  return store;
}
