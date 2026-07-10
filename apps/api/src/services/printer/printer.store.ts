import { promises as fs } from 'fs';
import path from 'path';
import type { PrintAgent, RegisteredPrinter } from '../../types/printer';

export class LocalPrinterStore {
  constructor(private readonly rootDir: string) {}

  async ensureReady(): Promise<void> {
    await fs.mkdir(this.rootDir, { recursive: true });
    await fs.mkdir(path.join(this.rootDir, 'agents'), { recursive: true });
  }

  private printerPath(id: string): string {
    return path.join(this.rootDir, `${id}.json`);
  }

  private agentPath(id: string): string {
    return path.join(this.rootDir, 'agents', `${id}.json`);
  }

  async savePrinter(printer: RegisteredPrinter): Promise<RegisteredPrinter> {
    await this.ensureReady();
    await fs.writeFile(this.printerPath(printer.id), JSON.stringify(printer, null, 2), 'utf8');
    return printer;
  }

  async getPrinter(id: string): Promise<RegisteredPrinter | null> {
    try {
      const raw = await fs.readFile(this.printerPath(id), 'utf8');
      return JSON.parse(raw) as RegisteredPrinter;
    } catch {
      return null;
    }
  }

  async listPrinters(): Promise<RegisteredPrinter[]> {
    await this.ensureReady();
    const files = await fs.readdir(this.rootDir);
    const printers: RegisteredPrinter[] = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const raw = await fs.readFile(path.join(this.rootDir, file), 'utf8');
        printers.push(JSON.parse(raw) as RegisteredPrinter);
      } catch {
        // skip
      }
    }
    return printers.sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  }

  async saveAgent(agent: PrintAgent): Promise<PrintAgent> {
    await this.ensureReady();
    await fs.writeFile(this.agentPath(agent.id), JSON.stringify(agent, null, 2), 'utf8');
    return agent;
  }

  async getAgent(id: string): Promise<PrintAgent | null> {
    try {
      const raw = await fs.readFile(this.agentPath(id), 'utf8');
      return JSON.parse(raw) as PrintAgent;
    } catch {
      return null;
    }
  }

  async listAgents(): Promise<PrintAgent[]> {
    await this.ensureReady();
    const dir = path.join(this.rootDir, 'agents');
    const files = await fs.readdir(dir);
    const agents: PrintAgent[] = [];
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      try {
        const raw = await fs.readFile(path.join(dir, file), 'utf8');
        agents.push(JSON.parse(raw) as PrintAgent);
      } catch {
        // skip
      }
    }
    return agents.sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
  }
}
