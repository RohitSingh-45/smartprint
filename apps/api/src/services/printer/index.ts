import path from 'path';
import { env } from '../../config/env';
import { LocalPrinterStore } from './printer.store';

let store: LocalPrinterStore | undefined;

export function getPrinterStore(): LocalPrinterStore {
  if (!store) {
    const rootDir = path.isAbsolute(env.printerDir)
      ? env.printerDir
      : path.resolve(process.cwd(), env.printerDir);
    store = new LocalPrinterStore(rootDir);
  }
  return store;
}
