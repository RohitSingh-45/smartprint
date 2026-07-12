import { env, resolveStorageDir } from '../../config/env';
import { LocalDraftStore } from './draft.store';

let store: LocalDraftStore | undefined;

export function getDraftStore(): LocalDraftStore {
  if (!store) {
    // resolveStorageDir keeps this writable on serverless (Vercel -> /tmp).
    store = new LocalDraftStore(resolveStorageDir(env.draftDir));
  }
  return store;
}
