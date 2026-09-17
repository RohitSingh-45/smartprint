import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { promisify } from 'util';
import { agentEnv, type SimulateFault } from './config';
import type { DispatchJob } from './api';

const execFileAsync = promisify(execFile);

export type LocalPrinter = {
  name: string;
  systemPrinterName: string;
  supportsColor: boolean;
  defaultPaperSize: string;
};

export type PrintResult =
  { ok: true } | { ok: false; fault: Exclude<SimulateFault, ''> | 'FAIL'; message: string };

/** Discover printers — mock list or CUPS `lpstat -a`. */
export async function discoverPrinters(): Promise<LocalPrinter[]> {
  if (agentEnv.printMode === 'mock') {
    return [
      {
        name: 'Campus Hub · Mock Laser',
        systemPrinterName: 'SmartPrint-Mock-Laser',
        supportsColor: true,
        defaultPaperSize: 'A4',
      },
      {
        name: 'Campus Hub · Mock B&W',
        systemPrinterName: 'SmartPrint-Mock-BW',
        supportsColor: false,
        defaultPaperSize: 'A4',
      },
    ];
  }

  try {
    const { stdout } = await execFileAsync('lpstat', ['-a'], { timeout: 5000 });
    const lines = stdout
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const printers = lines.map((line) => {
      const name = line.split(/\s+/)[0];
      return {
        name,
        systemPrinterName: name,
        supportsColor: true,
        defaultPaperSize: 'A4',
      };
    });
    if (printers.length > 0) return printers;
  } catch {
    // fall through to mock
  }

  console.warn('[agent] No CUPS printers found — falling back to mock printer list');
  return discoverPrintersWithMode('mock');
}

async function discoverPrintersWithMode(mode: 'mock'): Promise<LocalPrinter[]> {
  void mode;
  return [
    {
      name: 'Campus Hub · Mock Laser',
      systemPrinterName: 'SmartPrint-Mock-Laser',
      supportsColor: true,
      defaultPaperSize: 'A4',
    },
  ];
}

export async function ensureJobDir(): Promise<string> {
  const dir = path.isAbsolute(agentEnv.jobDir)
    ? agentEnv.jobDir
    : path.resolve(process.cwd(), agentEnv.jobDir);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function sendToSpooler(
  job: DispatchJob,
  pdf: Buffer,
  systemPrinterName: string,
): Promise<PrintResult> {
  const fault = agentEnv.simulateFault;
  if (fault) {
    return {
      ok: false,
      fault: fault === 'FAIL' ? 'FAIL' : fault,
      message: `Simulated fault: ${fault}`,
    };
  }

  const dir = await ensureJobDir();
  const filePath = path.join(dir, `${job.orderId}.pdf`);
  await fs.writeFile(filePath, pdf);

  if (agentEnv.printMode === 'mock') {
    // Simulate spooler latency
    await new Promise((r) => setTimeout(r, 400));
    console.log(
      `[agent] MOCK print → ${systemPrinterName} · ${job.fileName} · ${job.copies} copies · ${filePath}`,
    );
    return { ok: true };
  }

  try {
    const args = ['-d', systemPrinterName, '-n', String(Math.max(1, job.copies)), filePath];
    await execFileAsync('lp', args, { timeout: 30_000 });
    console.log(`[agent] Sent to CUPS printer ${systemPrinterName}: ${job.fileName}`);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'lp failed';
    return { ok: false, fault: 'FAIL', message };
  }
}

export function faultToPrinterStatus(fault: Exclude<SimulateFault, ''> | 'FAIL'): string {
  switch (fault) {
    case 'PAPER_JAM':
      return 'PAPER_JAM';
    case 'OUT_OF_PAPER':
      return 'OUT_OF_PAPER';
    case 'LOW_TONER':
      return 'LOW_TONER';
    case 'OFFLINE':
      return 'OFFLINE';
    case 'ERROR':
    case 'FAIL':
    default:
      return 'ERROR';
  }
}
