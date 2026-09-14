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

// ─────────────────────────────────────────────
// RAG Trend Analysis (context-stuffed order history)
// ─────────────────────────────────────────────

export type OrderSummaryForRAG = {
  id: string;
  status: string;
  amountPaid: number;
  totalPages: number;
  colorPages: number;
  bwPages: number;
  copies: number;
  paperSize: string;
  paidAt: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  printAttempts: number;
};

export function buildTrendAnalysisPrompt(params: {
  orders: OrderSummaryForRAG[];
  windowDays: number;
}): string {
  const { orders, windowDays } = params;

  // Compute aggregate context for Gemini (the RAG "context document")
  const totalRevenue = orders.reduce((s, o) => s + o.amountPaid, 0);
  const completed = orders.filter((o) => o.status === 'COMPLETED' || o.status === 'COLLECTED');
  const cancelled = orders.filter((o) => o.status === 'CANCELLED' || o.status === 'REJECTED');
  const failed = orders.filter((o) => o.status === 'FAILED');
  const avgPages = orders.length
    ? Math.round(orders.reduce((s, o) => s + o.totalPages, 0) / orders.length)
    : 0;
  const colorRatio = orders.length
    ? (
        orders.reduce((s, o) => s + o.colorPages, 0) /
        Math.max(1, orders.reduce((s, o) => s + o.totalPages, 0))
      ).toFixed(2)
    : '0';
  const avgRevenue = orders.length ? (totalRevenue / orders.length).toFixed(2) : '0';
  const paperSizeCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.paperSize] = (acc[o.paperSize] ?? 0) + 1;
    return acc;
  }, {});
  const topPaperSize = Object.entries(paperSizeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'a4';
  const retryOrders = orders.filter((o) => o.printAttempts > 1);

  // Build order-by-order context (RAG document) — last 20 orders for token efficiency
  const recentOrders = orders.slice(0, 20);
  const orderLines = recentOrders
    .map(
      (o) =>
        `[${o.id.slice(0, 8)}] ${o.status} | ₹${o.amountPaid} | ${o.totalPages}pp | C:${o.colorPages} BW:${o.bwPages} | ${o.paperSize} | paid:${o.paidAt.slice(0, 10)}`,
    )
    .join('\n');

  return `
You are SmartPrint RAG Analysis Engine — an AI that analyses historical print order data to identify business trends.

AGGREGATE STATS (last ${windowDays} days, ${orders.length} orders):
- Total revenue: ₹${totalRevenue.toLocaleString('en-IN')}
- Average order value: ₹${avgRevenue}
- Completed: ${completed.length} | Cancelled/Rejected: ${cancelled.length} | Failed: ${failed.length}
- Completion rate: ${orders.length ? ((completed.length / orders.length) * 100).toFixed(1) : 0}%
- Average pages per order: ${avgPages}
- Color/total page ratio: ${colorRatio} (${Math.round(parseFloat(colorRatio) * 100)}% color)
- Most used paper size: ${topPaperSize.toUpperCase()}
- Orders with retry (print failures): ${retryOrders.length}

RECENT ORDER LOG (RAG context):
${orderLines || 'No orders in this period.'}

YOUR JOB:
Based on this historical data, generate strategic business trend insights for the shop owner.
Identify patterns, revenue drivers, operational risks, and growth opportunities.
Be specific with numbers. Suggest concrete actions.

Respond with ONLY valid JSON:

{
  "period": "${windowDays} days",
  "totalOrders": ${orders.length},
  "totalRevenue": ${totalRevenue},
  "trends": [
    {
      "category": "<'revenue' | 'volume' | 'quality' | 'efficiency' | 'demand'>",
      "title": "<trend title>",
      "insight": "<2-3 sentence trend analysis with specific numbers>",
      "direction": "<'up' | 'down' | 'stable' | 'concern'>",
      "recommendation": "<concrete action>"
    }
  ],
  "topInsight": "<single most important finding in 1 sentence>",
  "forecastNote": "<1 sentence short-term forecast based on current patterns>"
}
`.trim();
}

// ─────────────────────────────────────────────
// PDF Computer Vision Classification
// ─────────────────────────────────────────────

export function buildPdfVisionPrompt(): string {
  return `
You are SmartPrint Vision AI. You have been given a PDF document (or its first page as an image).
Analyze the visual content and classify this document for optimal printing.

Examine:
- Document type (resume, invoice, academic paper, form, presentation, brochure, etc.)
- Content density (text-heavy vs image-heavy vs mixed)
- Color usage (mostly color, mostly B&W, or mixed)
- Layout (portrait/landscape, single/multi-column)
- Special features (tables, charts, photos, logos, handwriting)

Respond with ONLY valid JSON — no markdown, no explanation:

{
  "documentType": "<specific type, e.g. Academic Resume, Financial Invoice, Research Paper, Marketing Brochure>",
  "contentDescription": "<1-2 sentence description of what you see>",
  "colorRecommendation": "<'all_bw' | 'all_color' | 'mixed'>",
  "colorReason": "<why this color mode suits the content>",
  "orientationHint": "<'portrait' | 'landscape'>",
  "contentDensity": "<'text_heavy' | 'image_heavy' | 'mixed'>",
  "printQualityTip": "<1 sentence tip specific to this document type>",
  "confidence": <0.0-1.0>
}
`.trim();
}

// ─────────────────────────────────────────────
// Voice / Text Command Interpreter
// ─────────────────────────────────────────────

export function buildCommandInterpreterPrompt(params: {
  command: string;
  currentPage: string;
  availableRoutes: string[];
}): string {
  return `
You are SmartPrint Voice/Text Command AI. A shop operator has spoken or typed a command.
Interpret it and map it to a supported action.

CONTEXT:
- Current page: ${params.currentPage}
- Command spoken/typed: "${params.command}"

SUPPORTED NAVIGATION ROUTES:
${params.availableRoutes.map((r) => `  - ${r}`).join('\n')}

SUPPORTED ACTIONS:
- navigate: go to a page
- filter_orders: filter the orders list by status
- refresh: refresh the current page data
- unknown: command not understood

Examples:
- "show pending orders" → navigate to /admin/orders, filter=pending
- "go to queue" → navigate to /admin/queue
- "show me the dashboard" → navigate to /admin
- "open printer status" → navigate to /admin/printers
- "refresh" → refresh current page

Respond with ONLY valid JSON:

{
  "understood": <true|false>,
  "action": "<'navigate' | 'filter_orders' | 'refresh' | 'unknown'>",
  "route": "<target route if action=navigate, else null>",
  "filter": "<order status filter if action=filter_orders, else null>",
  "response": "<friendly voice response to the user, 1 sentence>",
  "confidence": <0.0-1.0>
}
`.trim();
}

// ─────────────────────────────────────────────
// Smart Pickup ETA & Queue Readiness Predictor
// ─────────────────────────────────────────────

export type EtaPredictionParams = {
  queuePosition: number;
  jobsAhead: number;
  totalPages: number;
  colorPages: number;
  bwPages: number;
  copies: number;
  paperSize: string;
  currentStatus: string;
  activePrintersCount?: number;
};

export function buildEtaPredictionPrompt(params: EtaPredictionParams): string {
  return `
You are SmartPrint Queue Intelligence AI. A student is tracking their print job on campus.
Predict the estimated completion time and pickup readiness advisory based on live print queue conditions.

ORDER & QUEUE CONTEXT:
- Current Job Status: ${params.currentStatus}
- Queue Position: ${params.queuePosition}
- Jobs Ahead in Queue: ${params.jobsAhead}
- User's Print Job: ${params.totalPages} page(s) (${params.colorPages} color, ${params.bwPages} B&W), ${params.copies} cop(ies), ${params.paperSize.toUpperCase()} paper
- Active Printers in Shop: ${params.activePrintersCount ?? 1}

PRINT SPEED BENCHMARKS:
- B&W A4: ~20-30 ppm (pages per minute)
- Color A4: ~10-15 ppm
- Job setup & handover overhead: ~30-60s per job
- Jobs ahead take on average ~1-2 min each unless the queue is clear

YOUR TASK:
Calculate realistic minimum and maximum wait minutes.
Classify campus rush level ('low' | 'moderate' | 'high').
Provide clear pickup advice (when the student should walk to the shop counter).

Respond with ONLY valid JSON:

{
  "estimatedMinutesMin": <number>,
  "estimatedMinutesMax": <number>,
  "estimatedTimeLabel": "<e.g. '3–5 minutes' or 'Under 2 minutes' or 'Ready now'>",
  "rushLevel": "<'low' | 'moderate' | 'high'>",
  "rushReason": "<1 sentence explanation of current queue conditions>",
  "pickupAdvice": "<1 sentence advice on when to head to the campus counter>",
  "confidence": <0.0-1.0>
}
`.trim();
}

