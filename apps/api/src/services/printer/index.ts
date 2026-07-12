import { env, resolveStorageDir } from '../../config/env';
import { LocalPrinterStore } from './printer.store';

let store: LocalPrinterStore | undefined;

export function getPrinterStore(): LocalPrinterStore {
  if (!store) {
    // resolveStorageDir keeps this writable on serverless (Vercel -> /tmp).
    store = new LocalPrinterStore(resolveStorageDir(env.printerDir));
  }
  return store;
}
