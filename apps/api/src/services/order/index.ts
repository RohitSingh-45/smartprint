import path from 'path';
import { env } from '../../config/env';
import { LocalOrderStore } from './order.store';

let store: LocalOrderStore | undefined;

export function getOrderStore(): LocalOrderStore {
  if (!store) {
    const rootDir = path.isAbsolute(env.orderDir)
      ? env.orderDir
      : path.resolve(process.cwd(), env.orderDir);
    store = new LocalOrderStore(rootDir);
  }
  return store;
}
