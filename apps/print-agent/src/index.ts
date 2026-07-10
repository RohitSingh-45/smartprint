import { promises as fs } from 'fs';
import path from 'path';
import { agentEnv } from './config';
import {
  claimJob,
  downloadJobPdf,
  fetchReadyJobs,
  registerAgent,
  registerPrinter,
  reportJobStatus,
  sendHeartbeat,
  type RegisteredPrinterDto,
} from './api';
import {
  discoverPrinters,
  ensureJobDir,
  faultToPrinterStatus,
  sendToSpooler,
} from './spooler';

const STATE_FILE = 'agent-state.json';

type AgentState = {
  agentId: string;
  printers: RegisteredPrinterDto[];
};

let busy = false;
let state: AgentState | null = null;

async function statePath(): Promise<string> {
  const dir = await ensureJobDir();
  return path.join(dir, STATE_FILE);
}

async function loadState(): Promise<AgentState | null> {
  try {
    const raw = await fs.readFile(await statePath(), 'utf8');
    return JSON.parse(raw) as AgentState;
  } catch {
    return null;
  }
}

async function saveState(next: AgentState): Promise<void> {
  await fs.writeFile(await statePath(), JSON.stringify(next, null, 2), 'utf8');
  state = next;
}

async function bootstrap(): Promise<AgentState> {
  const existing = await loadState();
  const { agent } = await registerAgent(existing?.agentId);
  console.log(`[agent] Registered as ${agent.id} (${agentEnv.name})`);

  const local = await discoverPrinters();
  const printers: RegisteredPrinterDto[] = [];
  for (const lp of local) {
    const prior = existing?.printers.find((p) => p.systemPrinterName === lp.systemPrinterName);
    const { printer } = await registerPrinter({
      agentId: agent.id,
      printerId: prior?.id,
      name: lp.name,
      systemPrinterName: lp.systemPrinterName,
      defaultPaperSize: lp.defaultPaperSize,
      supportsColor: lp.supportsColor,
      status: agentEnv.simulateFault === 'OFFLINE' ? 'OFFLINE' : 'ONLINE',
    });
    printers.push(printer);
    console.log(`[agent] Printer ready: ${printer.name} (${printer.id})`);
  }

  const next = { agentId: agent.id, printers };
  await saveState(next);
  return next;
}

async function heartbeatLoop(): Promise<void> {
  if (!state) return;
  try {
    await sendHeartbeat({
      agentId: state.agentId,
      printers: state.printers.map((p) => ({
        id: p.id,
        status: p.status,
        currentOrderId: null,
      })),
    });
  } catch (error) {
    console.warn('[agent] Heartbeat failed:', error instanceof Error ? error.message : error);
  }
}

async function processOneJob(): Promise<void> {
  if (!state || busy) return;
  if (agentEnv.simulateFault === 'OFFLINE') {
    return;
  }

  const { jobs } = await fetchReadyJobs();
  if (jobs.length === 0) return;

  const job = jobs[0];
  const printer = state.printers.find((p) => p.status !== 'OFFLINE') || state.printers[0];
  if (!printer) return;

  busy = true;
  try {
    console.log(`[agent] Claiming ${job.orderId} → ${printer.name}`);
    const { job: claimed } = await claimJob(job.orderId, state.agentId, printer.id);

    const pdf = await downloadJobPdf(claimed.contentUrl);
    const result = await sendToSpooler(claimed, pdf, printer.systemPrinterName);

    if (result.ok) {
      await reportJobStatus({
        orderId: claimed.orderId,
        agentId: state.agentId,
        printerId: printer.id,
        status: 'COMPLETED',
      });
      printer.status = 'ONLINE';
      console.log(`[agent] Completed ${claimed.orderId}`);
    } else {
      const status = faultToPrinterStatus(result.fault);
      printer.status = status;
      await reportJobStatus({
        orderId: claimed.orderId,
        agentId: state.agentId,
        printerId: printer.id,
        status: 'FAILED',
        error: result.message,
      });
      await sendHeartbeat({
        agentId: state.agentId,
        printers: [{ id: printer.id, status, currentOrderId: null, lastError: result.message }],
      });
      console.error(`[agent] Failed ${claimed.orderId}: ${result.message}`);
    }
    await saveState(state);
  } catch (error) {
    console.error('[agent] Job processing error:', error instanceof Error ? error.message : error);
  } finally {
    busy = false;
  }
}

async function main(): Promise<void> {
  console.log('[agent] SmartPrint Local Print Agent starting…');
  console.log(`[agent] API=${agentEnv.apiUrl} mode=${agentEnv.printMode}`);
  if (agentEnv.simulateFault) {
    console.log(`[agent] SIMULATE_FAULT=${agentEnv.simulateFault}`);
  }

  state = await bootstrap();

  setInterval(() => {
    void heartbeatLoop();
  }, agentEnv.heartbeatIntervalMs);

  setInterval(() => {
    void processOneJob().catch((error) => {
      console.error('[agent] Poll error:', error instanceof Error ? error.message : error);
    });
  }, agentEnv.pollIntervalMs);

  await heartbeatLoop();
  await processOneJob();
}

main().catch((error) => {
  console.error('[agent] Fatal:', error);
  process.exit(1);
});
