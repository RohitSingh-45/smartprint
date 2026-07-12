import { env, resolveStorageDir } from '../../config/env';
import { LocalOrderStore } from './order.store';

let store: LocalOrderStore | undefined;

export function getOrderStore(): LocalOrderStore {
  if (!store) {
    // resolveStorageDir keeps this writable on serverless (Vercel -> /tmp).
    store = new LocalOrderStore(resolveStorageDir(env.orderDir));
  }
  return store;
}
