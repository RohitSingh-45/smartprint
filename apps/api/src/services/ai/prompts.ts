/**
 * All AI prompt templates for SmartPrint.
 * Centralised here so prompts are easy to audit, version, and iterate on.
 */

// ─────────────────────────────────────────────
// Print Config Advisor
// ─────────────────────────────────────────────

export function buildConfigAdvisorPrompt(params: {
  fileName: string;
  totalPages: number;
  colorPageCount: number;
  bwPageCount: number;
  currentCopies: number;
  currentPaperSize: string;
  currentOrientation: string;
}): string {
  return `
You are SmartPrint AI, a smart printing assistant for a QR-based print shop platform in India.
A customer has uploaded a PDF and is about to configure their print settings.

FILE CONTEXT:
- File name: ${params.fileName}
- Total pages: ${params.totalPages}
- Pages detected as color: ${params.colorPageCount}
- Pages detected as black-and-white: ${params.bwPageCount}
- Current copies: ${params.currentCopies}
- Current paper size: ${params.currentPaperSize}
- Current orientation: ${params.currentOrientation}

YOUR JOB:
Analyze the file name and page-color distribution and give smart, practical printing recommendations.

Rules:
- Be concise and actionable
- Consider cost — B&W is cheaper; recommend B&W for text-heavy documents
- Only recommend color where it genuinely adds value (presentations, graphics)
- Infer document type from the filename (e.g., "resume", "invoice", "report", "slides")
- Pricing: B&W = ₹2/page, Color = ₹8/page, copies multiply cost

Respond with ONLY valid JSON, no markdown, no explanation outside the JSON object:

{
  "documentType": "<inferred document type, e.g. Resume, Presentation, Invoice, Report, Form>",
  "recommendation": "<2-3 sentence actionable recommendation>",
  "suggestedColorMode": "<'all_bw' | 'all_color' | 'mixed'>",
  "suggestedCopies": <number>,
  "suggestedPaperSize": "<'a4' | 'a3' | 'letter' | 'legal'>",
  "suggestedOrientation": "<'portrait' | 'landscape'>",
  "costSaving": "<brief note on cost, e.g. 'Switching all pages to B&W saves ₹48'>",
  "tips": ["<tip 1>", "<tip 2>"]
}
`.trim();
}

// ─────────────────────────────────────────────
// Admin Dashboard Insights
// ─────────────────────────────────────────────

export function buildDashboardInsightsPrompt(params: {
  todayRevenue: number;
  totalOrdersToday: number;
  pendingOrders: number;
  paidOrders: number;
  readyOrders: number;
  printingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageWaitingTimeLabel: string;
  totalQueueJobs: number;
  heldJobs: number;
}): string {
  const cancellationRate =
    params.totalOrdersToday > 0
      ? ((params.cancelledOrders / params.totalOrdersToday) * 100).toFixed(1)
      : '0';

  return `
You are SmartPrint AI, an operations analyst for a QR-based print shop.
You are analyzing today's operational data to generate actionable business insights.

TODAY'S METRICS:
- Revenue: ₹${params.todayRevenue}
- Total orders: ${params.totalOrdersToday}
- Pending (awaiting acceptance): ${params.pendingOrders}
- Paid (awaiting processing): ${params.paidOrders}
- In print queue: ${params.readyOrders}
- Currently printing: ${params.printingOrders}
- Completed: ${params.completedOrders}
- Cancelled/rejected: ${params.cancelledOrders}
- Cancellation rate: ${cancellationRate}%
- Average queue waiting time: ${params.averageWaitingTimeLabel}
- Total jobs in queue system: ${params.totalQueueJobs}
- Jobs on hold: ${params.heldJobs}

YOUR JOB:
Provide 3-4 concise, specific, actionable business insights for the print shop owner.
Focus on: bottlenecks, revenue opportunities, queue health, anomalies.

Respond with ONLY valid JSON, no markdown:

{
  "headline": "<1 sentence overall status, e.g. 'Operations running smoothly' or 'Queue backlog detected'>",
  "status": "<'healthy' | 'warning' | 'critical'>",
  "insights": [
    {
      "type": "<'revenue' | 'queue' | 'warning' | 'tip' | 'anomaly'>",
      "title": "<short title>",
      "body": "<2-3 sentence explanation with specific numbers>",
      "action": "<optional: specific recommended action>"
    }
  ],
  "summary": "<2-3 sentence executive summary of today's performance>"
}
`.trim();
}

// ─────────────────────────────────────────────
// Order Risk Assessment
// ─────────────────────────────────────────────

export function buildOrderRiskPrompt(params: {
  orderId: string;
  status: string;
  customerName: string;
  amountPaid: number;
  printAttempts: number;
  lastPrintError: string | null;
  waitingTimeMinutes: number | null;
  queuePosition: number | null;
  totalPages: number;
  copies: number;
  colorPages: number;
  bwPages: number;
}): string {
  return `
You are SmartPrint AI, a print job risk assessment system.
Evaluate the risk level of this print job and provide a brief explanation.

JOB DETAILS:
- Order ID: ${params.orderId}
- Status: ${params.status}
- Customer: ${params.customerName}
- Amount paid: ₹${params.amountPaid}
- Print attempts: ${params.printAttempts}
- Last print error: ${params.lastPrintError ?? 'None'}
- Time in current state: ${params.waitingTimeMinutes != null ? `${params.waitingTimeMinutes} minutes` : 'Unknown'}
- Queue position: ${params.queuePosition ?? 'Not in queue'}
- Total pages: ${params.totalPages}
- Copies: ${params.copies}
- Color pages: ${params.colorPages}
- B&W pages: ${params.bwPages}

Risk signals to consider:
- Multiple failed print attempts = HIGH risk
- Long wait time (>30 min in queue) = MEDIUM risk
- High value job (>₹200) = note in context
- Large job (>50 pages) = more likely to have issues
- Printer errors = HIGH risk

Respond with ONLY valid JSON:

{
  "riskLevel": "<'low' | 'medium' | 'high'>",
  "riskScore": <0-100>,
  "reason": "<1-2 sentence explanation>",
  "suggestedAction": "<optional specific action for the shop owner>"
}
`.trim();
}

// ─────────────────────────────────────────────
// Print Summary Explainer
// ─────────────────────────────────────────────

export function buildSummaryExplainerPrompt(params: {
  fileName: string;
  totalPages: number;
  printablePages: number;
  colorPages: number;
  bwPages: number;
  copies: number;
  paperSize: string;
  orientation: string;
  estimatedCost: number;
}): string {
  return `
You are SmartPrint AI helping a customer understand their print order before payment.

PRINT ORDER:
- File: ${params.fileName}
- Total pages in file: ${params.totalPages}
- Pages being printed: ${params.printablePages}
- Color pages: ${params.colorPages}
- B&W pages: ${params.bwPages}
- Copies: ${params.copies}
- Paper size: ${params.paperSize.toUpperCase()}
- Orientation: ${params.orientation}
- Estimated cost: ₹${params.estimatedCost}

Write a friendly, plain-English explanation of what this order means.
Be conversational, helpful, and confirm the customer made smart choices if applicable.
Mention any potential savings if they switch any color pages to B&W.

Respond with ONLY valid JSON:

{
  "explanation": "<2-3 friendly sentences explaining the order in plain language>",
  "valueNote": "<optional: note about cost-saving opportunity or confirmation they chose well>",
  "readyToOrder": <true|false>
}
`.trim();
}
