import { agentEnv } from './config';

export type DispatchJob = {
  orderId: string;
  uploadId: string;
  fileName: string;
  contentUrl: string;
  copies: number;
  pages: number[];
  colorPages: number[];
  bwPages: number[];
  paperSize: string;
  orientation: string;
  customerName: string;
  priority: number;
  readyAt: string | null;
  attempt: number;
};

export type RegisteredPrinterDto = {
  id: string;
  name: string;
  status: string;
  systemPrinterName: string;
  defaultPaperSize: string;
  supportsColor: boolean;
};

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${agentEnv.apiUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Agent-Token': agentEnv.token,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message =
      (typeof json.error === 'string' && json.error) ||
      `Agent API ${method} ${path} failed (${res.status})`;
    const error = new Error(message) as Error & { status?: number; code?: string };
    error.status = res.status;
    error.code = typeof json.code === 'string' ? json.code : undefined;
    throw error;
  }
  return json as T;
}

export async function registerAgent(agentId?: string) {
  return api<{ agent: { id: string; name: string } }>('POST', '/api/agent/register', {
    agentId,
    name: agentEnv.name,
    hostname: agentEnv.hostname,
  });
}

export async function registerPrinter(input: {
  agentId: string;
  name: string;
  systemPrinterName: string;
  defaultPaperSize?: string;
  supportsColor?: boolean;
  status?: string;
  printerId?: string;
}) {
  return api<{ printer: RegisteredPrinterDto }>('POST', '/api/agent/printers', input);
}

export async function sendHeartbeat(input: {
  agentId: string;
  printers: Array<{
    id: string;
    status?: string;
    currentOrderId?: string | null;
    lastError?: string | null;
  }>;
}) {
  return api<{ agent: { id: string }; printers: RegisteredPrinterDto[] }>(
    'POST',
    '/api/agent/heartbeat',
    input,
  );
}

export async function fetchReadyJobs() {
  return api<{ jobs: DispatchJob[]; count: number }>('GET', '/api/agent/jobs/ready');
}

export async function claimJob(orderId: string, agentId: string, printerId: string) {
  return api<{ job: DispatchJob }>('POST', `/api/agent/jobs/${orderId}/claim`, {
    agentId,
    printerId,
  });
}

export async function reportJobStatus(input: {
  orderId: string;
  agentId: string;
  printerId: string;
  status: 'PRINTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  error?: string;
}) {
  return api<{ order: { id: string; status: string } }>(
    'POST',
    `/api/agent/jobs/${input.orderId}/status`,
    {
      agentId: input.agentId,
      printerId: input.printerId,
      status: input.status,
      error: input.error,
    },
  );
}

export async function downloadJobPdf(contentUrl: string): Promise<Buffer> {
  const url = contentUrl.startsWith('http') ? contentUrl : `${agentEnv.apiUrl}${contentUrl}`;
  const res = await fetch(url, {
    headers: { 'X-Agent-Token': agentEnv.token },
  });
  if (!res.ok) {
    throw new Error(`Failed to download print PDF (${res.status})`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
