import dotenv from 'dotenv';
import { resolve } from 'path';
import os from 'os';

dotenv.config({ path: resolve(__dirname, '../.env') });

export type PrintMode = 'mock' | 'system';
export type SimulateFault =
  'PAPER_JAM' | 'OUT_OF_PAPER' | 'LOW_TONER' | 'ERROR' | 'OFFLINE' | 'FAIL' | '';

export const agentEnv = {
  apiUrl: (process.env.SMARTPRINT_API_URL || 'http://localhost:4000').replace(/\/$/, ''),
  token: process.env.PRINT_AGENT_TOKEN || 'smartprint-dev-agent-token',
  name: process.env.AGENT_NAME || `SmartPrint Agent (${os.hostname()})`,
  hostname: os.hostname(),
  printMode: (process.env.PRINT_MODE === 'system' ? 'system' : 'mock') as PrintMode,
  simulateFault: (process.env.SIMULATE_FAULT || '') as SimulateFault,
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS || 3000),
  heartbeatIntervalMs: Number(process.env.HEARTBEAT_INTERVAL_MS || 10000),
  jobDir: process.env.JOB_DIR || 'agent-jobs',
};
