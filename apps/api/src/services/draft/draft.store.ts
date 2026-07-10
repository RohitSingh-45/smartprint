import { promises as fs } from 'fs';
import path from 'path';
import type { DraftOrder } from '../../types/draft';

/**
 * Local JSON draft store for Sprint 6.
 * Swap for MongoDB later without changing controllers.
 */
export class LocalDraftStore {
  constructor(private readonly rootDir: string) {}

  async ensureReady(): Promise<void> {
    await fs.mkdir(this.rootDir, { recursive: true });
  }

  private filePath(id: string): string {
    return path.join(this.rootDir, `${id}.json`);
  }

  async save(draft: DraftOrder): Promise<DraftOrder> {
    await this.ensureReady();
    await fs.writeFile(this.filePath(draft.id), JSON.stringify(draft, null, 2), 'utf8');
    return draft;
  }

  async get(id: string): Promise<DraftOrder | null> {
    try {
      const raw = await fs.readFile(this.filePath(id), 'utf8');
      return JSON.parse(raw) as DraftOrder;
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await fs.unlink(this.filePath(id));
      return true;
    } catch {
      return false;
    }
  }
}
