# SmartPrint Local Print Agent

Runs on the **print shop computer**. The browser never talks to printers.

```text
SmartPrint API  ←(token)→  Local Print Agent  →  OS spooler (CUPS `lp` or mock)
```

## Quick start

```bash
# Terminal 1 — API
cd apps/api && PRINT_AGENT_TOKEN=smartprint-dev-agent-token npm run dev

# Terminal 2 — Agent
cd apps/print-agent
cp .env.example .env
npm install
npm run dev
```

## Modes

| `PRINT_MODE` | Behavior |
|--------------|----------|
| `mock` (default) | Writes PDF to `agent-jobs/` and pretends to print |
| `system` | Uses CUPS `lp` / `lpstat` when available |

## Simulate faults

Set `SIMULATE_FAULT` then restart the agent (or export for one run):

```bash
SIMULATE_FAULT=PAPER_JAM npm run dev
SIMULATE_FAULT=OUT_OF_PAPER npm run dev
SIMULATE_FAULT=LOW_TONER npm run dev
SIMULATE_FAULT=ERROR npm run dev
SIMULATE_FAULT=OFFLINE npm run dev   # skips claiming jobs
SIMULATE_FAULT=FAIL npm run dev     # generic print failure
```

## Agent restart

State (`agentId` + printer ids) is saved under `agent-jobs/agent-state.json` so restarts re-register the same agent/printers.

## Security

- Auth: `X-Agent-Token` must match API `PRINT_AGENT_TOKEN`
- Never put the token in `NEXT_PUBLIC_*` or browser code
