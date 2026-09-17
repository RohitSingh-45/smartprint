import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { safeParseJson } from './aiUtils';
import {
  buildConfigAdvisorPrompt,
  buildDashboardInsightsPrompt,
  buildOrderRiskPrompt,
  buildSummaryExplainerPrompt,
  buildTrendAnalysisPrompt,
  buildPdfVisionPrompt,
  buildCommandInterpreterPrompt,
  buildEtaPredictionPrompt,
  type EtaPredictionParams,
  type OrderSummaryForRAG,
} from './prompts';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type ConfigAdvisorResult = {
  documentType: string;
  recommendation: string;
  suggestedColorMode: 'all_bw' | 'all_color' | 'mixed';
  suggestedCopies: number;
  suggestedPaperSize: 'a4' | 'a3' | 'letter' | 'legal';
  suggestedOrientation: 'portrait' | 'landscape';
  costSaving: string;
  tips: string[];
  isMock?: boolean;
};

export type DashboardInsight = {
  type: 'revenue' | 'queue' | 'warning' | 'tip' | 'anomaly';
  title: string;
  body: string;
  action?: string;
};

export type DashboardInsightsResult = {
  headline: string;
  status: 'healthy' | 'warning' | 'critical';
  insights: DashboardInsight[];
  summary: string;
  isMock?: boolean;
};

export type OrderRiskResult = {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  reason: string;
  suggestedAction?: string;
  isMock?: boolean;
};

export type SummaryExplainerResult = {
  explanation: string;
  valueNote?: string;
  readyToOrder: boolean;
  isMock?: boolean;
};

// ─────────────────────────────────────────────
// Gemini Client (lazy-initialized)
// ─────────────────────────────────────────────

let genai: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genai) {
    if (!env.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set. Set AI_MODE=mock to use mock responses.');
    }
    genai = new GoogleGenerativeAI(env.geminiApiKey);
  }
  return genai;
}

const MODEL_NAME = 'gemini-2.0-flash';

async function callGemini(prompt: string): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─────────────────────────────────────────────
// Mock Responses (AI_MODE=mock)
// ─────────────────────────────────────────────

function mockConfigAdvisor(params: {
  fileName: string;
  totalPages: number;
  colorPageCount: number;
  bwPageCount: number;
  currentCopies: number;
  currentPaperSize: string;
  currentOrientation: string;
}): ConfigAdvisorResult {
  const name = params.fileName.toLowerCase();
  const isResume = name.includes('resume') || name.includes('cv');
  const isPresentation =
    name.includes('slide') || name.includes('ppt') || name.includes('presentation');
  const isInvoice = name.includes('invoice') || name.includes('bill') || name.includes('receipt');

  let documentType = 'Document';
  let recommendation = '';
  let suggestedColorMode: ConfigAdvisorResult['suggestedColorMode'] = 'all_bw';
  let tips: string[] = [];

  if (isResume) {
    documentType = 'Resume / CV';
    recommendation =
      'Resumes are text-heavy and look professional in B&W. Printing in black-and-white saves you money without affecting quality.';
    suggestedColorMode = 'all_bw';
    tips = [
      'Use A4 portrait for standard resume formatting.',
      'Single copy is usually sufficient for walk-in submission.',
    ];
  } else if (isPresentation) {
    documentType = 'Presentation Slides';
    recommendation =
      'Presentation slides often have colored charts and graphics that lose clarity in B&W. Color printing is recommended here.';
    suggestedColorMode = params.colorPageCount > params.bwPageCount ? 'all_color' : 'mixed';
    tips = [
      'Consider landscape orientation for slide decks.',
      'If slides are text-only, B&W saves ₹' + params.totalPages * 6 + '.',
    ];
  } else if (isInvoice) {
    documentType = 'Invoice / Bill';
    recommendation =
      'Invoices and bills are best printed in B&W. The information is clear and it is the most cost-effective option.';
    suggestedColorMode = 'all_bw';
    tips = [
      'A4 portrait is standard for invoices.',
      'Verify total pages match the number of invoice sheets needed.',
    ];
  } else {
    documentType = 'General Document';
    recommendation =
      params.colorPageCount > Math.floor(params.totalPages / 2)
        ? "More than half your pages have color content. Color printing will preserve your document's full fidelity."
        : 'Most of your pages appear to be text. Switching to B&W printing will save you cost without affecting readability.';
    suggestedColorMode = params.colorPageCount > params.bwPageCount ? 'all_color' : 'all_bw';
    tips = [
      'Review page range to print only the pages you need.',
      'For multi-page documents, double-sided printing (if available) halves your paper use.',
    ];
  }

  const colorSaving = params.colorPageCount * 6;
  return {
    documentType,
    recommendation,
    suggestedColorMode,
    suggestedCopies: params.currentCopies,
    suggestedPaperSize: 'a4',
    suggestedOrientation: isPresentation ? 'landscape' : 'portrait',
    costSaving:
      colorSaving > 0 && suggestedColorMode === 'all_bw'
        ? `Switching ${params.colorPageCount} color pages to B&W saves ₹${colorSaving}`
        : 'Your current color settings are optimized for this document.',
    tips,
    isMock: true,
  };
}

function mockDashboardInsights(
  params: Parameters<typeof buildDashboardInsightsPrompt>[0],
): DashboardInsightsResult {
  const cancellationRate =
    params.totalOrdersToday > 0 ? (params.cancelledOrders / params.totalOrdersToday) * 100 : 0;

  const status: DashboardInsightsResult['status'] =
    params.pendingOrders > 5 || cancellationRate > 20
      ? 'warning'
      : params.cancelledOrders > params.completedOrders
        ? 'critical'
        : 'healthy';

  const insights: DashboardInsight[] = [];

  if (params.todayRevenue > 0) {
    insights.push({
      type: 'revenue',
      title: `₹${params.todayRevenue.toLocaleString('en-IN')} earned today`,
      body: `You have processed ${params.totalOrdersToday} order${params.totalOrdersToday !== 1 ? 's' : ''} today with a total revenue of ₹${params.todayRevenue.toLocaleString('en-IN')}. ${params.completedOrders} jobs have been successfully completed.`,
      action:
        params.pendingOrders > 0
          ? `Accept ${params.pendingOrders} pending orders to increase throughput.`
          : undefined,
    });
  }

  if (params.pendingOrders > 3) {
    insights.push({
      type: 'warning',
      title: `${params.pendingOrders} orders awaiting review`,
      body: `There are ${params.pendingOrders} paid orders sitting in the pending queue waiting for acceptance. Customers may be waiting for confirmation. Quick acceptance improves customer satisfaction.`,
      action: 'Go to Orders to batch-accept pending jobs.',
    });
  }

  if (params.heldJobs > 0) {
    insights.push({
      type: 'queue',
      title: `${params.heldJobs} job${params.heldJobs > 1 ? 's' : ''} on hold`,
      body: `${params.heldJobs} print job${params.heldJobs > 1 ? 's are' : ' is'} currently on hold in the queue. Held jobs block throughput and delay customer pickup. Review these jobs and resume or cancel them.`,
      action: 'Open the Queue to review held jobs.',
    });
  }

  if (cancellationRate > 15) {
    insights.push({
      type: 'anomaly',
      title: `${cancellationRate.toFixed(1)}% cancellation rate`,
      body: `Cancellations are higher than normal at ${cancellationRate.toFixed(1)}%. This could indicate issues with pricing, long wait times, or technical errors. Investigate cancelled orders for patterns.`,
      action: 'Filter orders by Cancelled status to identify trends.',
    });
  } else {
    insights.push({
      type: 'tip',
      title: 'Queue health is good',
      body: `Average wait time is ${params.averageWaitingTimeLabel}. ${params.readyOrders} jobs are ready for printing. Operations are flowing well today.`,
    });
  }

  return {
    headline:
      status === 'healthy'
        ? 'Operations running smoothly today'
        : status === 'warning'
          ? 'Attention needed on a few items'
          : 'Critical issues require immediate action',
    status,
    insights,
    summary: `Today you processed ${params.totalOrdersToday} orders generating ₹${params.todayRevenue.toLocaleString('en-IN')} in revenue. ${params.completedOrders} jobs completed, ${params.pendingOrders} pending, ${params.cancelledOrders} cancelled.`,
    isMock: true,
  };
}

function mockOrderRisk(params: Parameters<typeof buildOrderRiskPrompt>[0]): OrderRiskResult {
  let riskScore = 0;
  const reasons: string[] = [];

  if ((params.printAttempts ?? 0) >= 3) {
    riskScore += 60;
    reasons.push('multiple failed attempts');
  } else if ((params.printAttempts ?? 0) >= 1) {
    riskScore += 20;
    reasons.push('previous attempt failed');
  }

  if (params.lastPrintError) {
    riskScore += 20;
    reasons.push('active print error');
  }
  if (params.waitingTimeMinutes != null && params.waitingTimeMinutes > 45) {
    riskScore += 25;
    reasons.push('long queue wait');
  } else if (params.waitingTimeMinutes != null && params.waitingTimeMinutes > 20) {
    riskScore += 10;
  }

  const totalSheets = params.totalPages * params.copies;
  if (totalSheets > 100) {
    riskScore += 10;
    reasons.push('large job');
  }

  riskScore = Math.min(riskScore, 100);

  const riskLevel: OrderRiskResult['riskLevel'] =
    riskScore >= 60 ? 'high' : riskScore >= 25 ? 'medium' : 'low';

  const reason =
    reasons.length > 0
      ? `This order shows risk signals: ${reasons.join(', ')}.`
      : 'No significant risk signals detected. This job appears to be proceeding normally.';

  return {
    riskLevel,
    riskScore,
    reason,
    suggestedAction:
      riskLevel === 'high'
        ? 'Check printer status and consider manually retrying or reassigning this job.'
        : riskLevel === 'medium'
          ? 'Monitor this job closely for any new errors.'
          : undefined,
    isMock: true,
  };
}

function mockSummaryExplainer(
  params: Parameters<typeof buildSummaryExplainerPrompt>[0],
): SummaryExplainerResult {
  const totalSheets = params.printablePages * params.copies;
  const potentialSaving = params.colorPages > 0 ? params.colorPages * params.copies * 6 : 0;

  return {
    explanation: `You are printing ${params.printablePages} page${params.printablePages !== 1 ? 's' : ''} from "${params.fileName}" on ${params.paperSize.toUpperCase()} paper in ${params.orientation} orientation. With ${params.copies} cop${params.copies !== 1 ? 'ies' : 'y'}, that is ${totalSheets} sheet${totalSheets !== 1 ? 's' : ''} total, costing an estimated ₹${params.estimatedCost}.`,
    valueNote:
      potentialSaving > 0
        ? `💡 Switching your ${params.colorPages} color page${params.colorPages > 1 ? 's' : ''} to B&W could save you ₹${potentialSaving}.`
        : `✅ You have chosen B&W for all pages — great choice for cost savings!`,
    readyToOrder: true,
    isMock: true,
  };
}

// ─────────────────────────────────────────────
// Public AI Service Functions
// ─────────────────────────────────────────────

type ConfigAdvisorParams = {
  fileName: string;
  totalPages: number;
  colorPageCount: number;
  bwPageCount: number;
  currentCopies: number;
  currentPaperSize: string;
  currentOrientation: string;
};

export async function getConfigAdvisor(params: ConfigAdvisorParams): Promise<ConfigAdvisorResult> {
  if (env.aiMode === 'mock') {
    return mockConfigAdvisor(params);
  }

  try {
    const prompt = buildConfigAdvisorPrompt(params);
    const text = await callGemini(prompt);
    const parsed = safeParseJson<ConfigAdvisorResult>(text);

    if (!parsed) {
      console.error('[ai] Failed to parse config advisor response:', text);
      return mockConfigAdvisor(params);
    }
    return parsed;
  } catch (err) {
    console.error('[ai] Config advisor call failed, falling back to mock:', err);
    return mockConfigAdvisor(params);
  }
}

export async function getDashboardInsights(
  params: Parameters<typeof buildDashboardInsightsPrompt>[0],
): Promise<DashboardInsightsResult> {
  if (env.aiMode === 'mock') {
    return mockDashboardInsights(params);
  }

  try {
    const prompt = buildDashboardInsightsPrompt(params);
    const text = await callGemini(prompt);
    const parsed = safeParseJson<DashboardInsightsResult>(text);

    if (!parsed) {
      console.error('[ai] Failed to parse dashboard insights response:', text);
      return mockDashboardInsights(params);
    }
    return parsed;
  } catch (err) {
    console.error('[ai] Dashboard insights call failed, falling back to mock:', err);
    return mockDashboardInsights(params);
  }
}

export async function getOrderRisk(
  params: Parameters<typeof buildOrderRiskPrompt>[0],
): Promise<OrderRiskResult> {
  if (env.aiMode === 'mock') {
    return mockOrderRisk(params);
  }

  try {
    const prompt = buildOrderRiskPrompt(params);
    const text = await callGemini(prompt);
    const parsed = safeParseJson<OrderRiskResult>(text);

    if (!parsed) {
      console.error('[ai] Failed to parse order risk response:', text);
      return mockOrderRisk(params);
    }
    return parsed;
  } catch (err) {
    console.error('[ai] Order risk call failed, falling back to mock:', err);
    return mockOrderRisk(params);
  }
}

export async function getSummaryExplainer(
  params: Parameters<typeof buildSummaryExplainerPrompt>[0],
): Promise<SummaryExplainerResult> {
  if (env.aiMode === 'mock') {
    return mockSummaryExplainer(params);
  }

  try {
    const prompt = buildSummaryExplainerPrompt(params);
    const text = await callGemini(prompt);
    const parsed = safeParseJson<SummaryExplainerResult>(text);

    if (!parsed) {
      console.error('[ai] Failed to parse summary explainer response:', text);
      return mockSummaryExplainer(params);
    }
    return parsed;
  } catch (err) {
    console.error('[ai] Summary explainer call failed, falling back to mock:', err);
    return mockSummaryExplainer(params);
  }
}

// ─────────────────────────────────────────────
// Feature 5: RAG Trend Analysis
// ─────────────────────────────────────────────

export type TrendItem = {
  category: 'revenue' | 'volume' | 'quality' | 'efficiency' | 'demand';
  title: string;
  insight: string;
  direction: 'up' | 'down' | 'stable' | 'concern';
  recommendation: string;
};

export type TrendAnalysisResult = {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  trends: TrendItem[];
  topInsight: string;
  forecastNote: string;
  isMock?: boolean;
};

export { type OrderSummaryForRAG };

function mockTrendAnalysis(orders: OrderSummaryForRAG[], windowDays: number): TrendAnalysisResult {
  const totalRevenue = orders.reduce((s, o) => s + o.amountPaid, 0);
  const completed = orders.filter((o) => ['COMPLETED', 'COLLECTED'].includes(o.status)).length;
  const cancelled = orders.filter((o) => ['CANCELLED', 'REJECTED'].includes(o.status)).length;
  const failed = orders.filter((o) => o.status === 'FAILED').length;
  const completionRate = orders.length ? ((completed / orders.length) * 100).toFixed(1) : '0';
  const colorPages = orders.reduce((s, o) => s + o.colorPages, 0);
  const totalPages = orders.reduce((s, o) => s + o.totalPages, 0);
  const colorPct = totalPages ? Math.round((colorPages / totalPages) * 100) : 0;
  const avgValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;
  const retryCount = orders.filter((o) => o.printAttempts > 1).length;

  const trends: TrendItem[] = [];

  trends.push({
    category: 'revenue',
    title: `₹${totalRevenue.toLocaleString('en-IN')} in ${windowDays} days`,
    insight: `Total revenue over the last ${windowDays} days is ₹${totalRevenue.toLocaleString('en-IN')} across ${orders.length} orders. Average order value is ₹${avgValue}.`,
    direction: totalRevenue > 0 ? 'up' : 'stable',
    recommendation:
      avgValue < 50
        ? 'Consider encouraging multi-copy orders — currently avg order value is low.'
        : 'Avg order value is healthy. Focus on increasing order frequency.',
  });

  trends.push({
    category: 'quality',
    title: `${completionRate}% completion rate`,
    insight: `${completed} orders completed, ${cancelled} cancelled, ${failed} failed out of ${orders.length} total. ${retryCount} jobs required a retry, indicating ${retryCount > 2 ? 'recurring' : 'occasional'} printer reliability issues.`,
    direction:
      parseFloat(completionRate) > 80
        ? 'up'
        : parseFloat(completionRate) > 60
          ? 'stable'
          : 'concern',
    recommendation:
      cancelled > completed
        ? 'High cancellation rate detected. Review wait times — customers may be abandoning orders.'
        : retryCount > 0
          ? `${retryCount} jobs needed retries. Check printer maintenance schedule.`
          : 'Great completion rate! Keep monitoring printer health.',
  });

  trends.push({
    category: 'demand',
    title: `${colorPct}% color demand`,
    insight: `${colorPct}% of all printed pages were in color across the last ${windowDays} days. ${colorPct > 50 ? 'Color-heavy orders are the norm — ensure color ink is well-stocked.' : 'Most customers prefer B&W — cost-effective and profitable per page.'}`,
    direction: colorPct > 60 ? 'up' : 'stable',
    recommendation:
      colorPct > 60
        ? 'Stock extra color ink cartridges — demand is high.'
        : 'Promote color printing for presentations and marketing materials to boost revenue per order.',
  });

  trends.push({
    category: 'efficiency',
    title: 'Throughput analysis',
    insight: `Processed an average of ${(orders.length / Math.max(windowDays, 1)).toFixed(1)} orders/day. ${orders.length < 5 ? 'Low volume — early stage or off-peak period.' : orders.length < 20 ? 'Moderate volume. Operational capacity is adequate.' : 'High volume. Consider queue management and printer scaling.'}`,
    direction: orders.length > 10 ? 'up' : 'stable',
    recommendation:
      orders.length < 5
        ? 'Drive more traffic via QR code placement in high-footfall areas.'
        : 'Consider batch-acceptance windows to speed up throughput during peak hours.',
  });

  return {
    period: `${windowDays} days`,
    totalOrders: orders.length,
    totalRevenue,
    trends,
    topInsight:
      orders.length === 0
        ? 'No order history yet. Start accepting orders to see trend analysis.'
        : `Revenue of ₹${totalRevenue.toLocaleString('en-IN')} with a ${completionRate}% completion rate over ${windowDays} days.`,
    forecastNote:
      orders.length > 5
        ? `Based on current volume, next ${windowDays} days projected at ₹${Math.round(totalRevenue * 1.1).toLocaleString('en-IN')} with stable growth.`
        : 'Insufficient data for a reliable forecast — keep tracking orders.',
    isMock: true,
  };
}

export async function getTrendAnalysis(
  orders: OrderSummaryForRAG[],
  windowDays = 30,
): Promise<TrendAnalysisResult> {
  if (env.aiMode === 'mock') {
    return mockTrendAnalysis(orders, windowDays);
  }
  try {
    const prompt = buildTrendAnalysisPrompt({ orders, windowDays });
    const text = await callGemini(prompt);
    const parsed = safeParseJson<TrendAnalysisResult>(text);
    if (!parsed) {
      console.error('[ai] Failed to parse trend analysis response:', text);
      return mockTrendAnalysis(orders, windowDays);
    }
    return parsed;
  } catch (err) {
    console.error('[ai] Trend analysis call failed, falling back to mock:', err);
    return mockTrendAnalysis(orders, windowDays);
  }
}

// ─────────────────────────────────────────────
// Feature 6: Computer Vision PDF Classification
// ─────────────────────────────────────────────

export type PdfClassificationResult = {
  documentType: string;
  contentDescription: string;
  colorRecommendation: 'all_bw' | 'all_color' | 'mixed';
  colorReason: string;
  orientationHint: 'portrait' | 'landscape';
  contentDensity: 'text_heavy' | 'image_heavy' | 'mixed';
  printQualityTip: string;
  confidence: number;
  isMock?: boolean;
};

function mockPdfVision(fileName: string): PdfClassificationResult {
  const name = fileName.toLowerCase();
  const isResume = name.includes('resume') || name.includes('cv');
  const isSlides = name.includes('slide') || name.includes('ppt') || name.includes('deck');
  const isInvoice = name.includes('invoice') || name.includes('bill');
  const isForm = name.includes('form') || name.includes('application');
  const isReport = name.includes('report') || name.includes('thesis') || name.includes('paper');

  if (isResume) {
    return {
      documentType: 'Professional Resume / CV',
      contentDescription:
        'A professional resume with contact information, work experience, and skills sections. Text-heavy with clean single-column layout.',
      colorRecommendation: 'all_bw',
      colorReason: 'Resume content is predominantly text; B&W is professional and cost-effective.',
      orientationHint: 'portrait',
      contentDensity: 'text_heavy',
      printQualityTip: 'Use high-quality plain paper for a professional finish.',
      confidence: 0.92,
      isMock: true,
    };
  }
  if (isSlides) {
    return {
      documentType: 'Presentation Slides',
      contentDescription:
        'A slide deck with titled slides, bullet points, and likely charts or visual elements. Multi-column or full-bleed layout.',
      colorRecommendation: 'all_color',
      colorReason:
        'Slides typically use color themes, charts, and images that lose context in B&W.',
      orientationHint: 'landscape',
      contentDensity: 'mixed',
      printQualityTip: 'Print at highest DPI for sharp chart and image reproduction.',
      confidence: 0.88,
      isMock: true,
    };
  }
  if (isInvoice) {
    return {
      documentType: 'Financial Invoice / Bill',
      contentDescription:
        'A structured invoice document with line items, totals, and company branding. Table-heavy layout.',
      colorRecommendation: 'all_bw',
      colorReason: 'Financial documents are table-driven and fully readable in B&W.',
      orientationHint: 'portrait',
      contentDensity: 'text_heavy',
      printQualityTip: 'Ensure all table borders are legible — use standard DPI.',
      confidence: 0.95,
      isMock: true,
    };
  }
  if (isForm) {
    return {
      documentType: 'Official Form / Application',
      contentDescription:
        'A structured form with input fields and labels. May include checkboxes, signature lines, and instructional text.',
      colorRecommendation: 'all_bw',
      colorReason: 'Forms are functional documents — B&W prints clearly and saves cost.',
      orientationHint: 'portrait',
      contentDensity: 'text_heavy',
      printQualityTip: 'Verify all checkbox borders are visible before printing multiple copies.',
      confidence: 0.9,
      isMock: true,
    };
  }
  if (isReport) {
    return {
      documentType: 'Academic / Technical Report',
      contentDescription:
        'A multi-page report or paper with abstract, headings, paragraphs, and possibly charts or figures.',
      colorRecommendation: 'mixed',
      colorReason:
        'Reports often have color charts or figures; mixed mode saves cost on text-only pages.',
      orientationHint: 'portrait',
      contentDensity: 'text_heavy',
      printQualityTip: 'Use mixed color mode — color for figures, B&W for text pages.',
      confidence: 0.85,
      isMock: true,
    };
  }
  return {
    documentType: 'General Document',
    contentDescription:
      'A general-purpose document. Content detected but no specific document type pattern identified from filename.',
    colorRecommendation: 'all_bw',
    colorReason: 'Default recommendation is B&W for cost savings unless color is essential.',
    orientationHint: 'portrait',
    contentDensity: 'mixed',
    printQualityTip: 'Preview all pages before printing to confirm color needs.',
    confidence: 0.65,
    isMock: true,
  };
}

export async function classifyPdfVision(
  pdfBuffer: Buffer,
  fileName: string,
): Promise<PdfClassificationResult> {
  if (env.aiMode === 'mock') {
    return mockPdfVision(fileName);
  }
  try {
    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = buildPdfVisionPrompt();
    // Send PDF as inline data to Gemini Vision
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBuffer.toString('base64'),
        },
      },
    ]);
    const text = result.response.text();
    const parsed = safeParseJson<PdfClassificationResult>(text);
    if (!parsed) {
      console.error('[ai] Failed to parse PDF vision response:', text);
      return mockPdfVision(fileName);
    }
    return parsed;
  } catch (err) {
    console.error('[ai] PDF vision call failed:', err);
    return mockPdfVision(fileName);
  }
}

// ─────────────────────────────────────────────
// Feature 7: Voice / Text Command Interpreter
// ─────────────────────────────────────────────

export type CommandResult = {
  understood: boolean;
  action: 'navigate' | 'filter_orders' | 'refresh' | 'unknown';
  route: string | null;
  filter: string | null;
  response: string;
  confidence: number;
  isMock?: boolean;
};

const ROUTE_MAP: Record<string, string> = {
  dashboard: '/admin',
  home: '/admin',
  overview: '/admin',
  orders: '/admin/orders',
  'pending orders': '/admin/orders',
  queue: '/admin/queue',
  'print queue': '/admin/queue',
  printers: '/admin/printers',
  'printer status': '/admin/printers',
  trends: '/admin/trends',
  analytics: '/admin/trends',
  'business intelligence': '/admin/trends',
  upload: '/print/upload',
};

const STATUS_MAP: Record<string, string> = {
  pending: 'pending',
  paid: 'paid',
  accepted: 'accepted',
  queued: 'queued',
  ready: 'ready',
  printing: 'printing',
  completed: 'completed',
  cancelled: 'cancelled',
  rejected: 'cancelled',
  failed: 'failed',
  held: 'held',
};

function mockCommandInterpreter(command: string): CommandResult {
  const lower = command.toLowerCase().trim();

  // Check refresh
  if (lower === 'refresh' || lower === 'reload' || lower.includes('refresh')) {
    return {
      understood: true,
      action: 'refresh',
      route: null,
      filter: null,
      response: 'Refreshing the current page.',
      confidence: 0.95,
      isMock: true,
    };
  }

  // Check navigation routes
  for (const [key, route] of Object.entries(ROUTE_MAP)) {
    if (lower.includes(key)) {
      // Check for status filter inside orders commands
      if (route === '/admin/orders') {
        for (const [statusKey, statusVal] of Object.entries(STATUS_MAP)) {
          if (lower.includes(statusKey)) {
            return {
              understood: true,
              action: 'filter_orders',
              route: '/admin/orders',
              filter: statusVal,
              response: `Showing ${statusKey} orders.`,
              confidence: 0.9,
              isMock: true,
            };
          }
        }
      }
      return {
        understood: true,
        action: 'navigate',
        route,
        filter: null,
        response: `Navigating to ${route.replace('/admin/', '').replace('/admin', 'dashboard')}.`,
        confidence: 0.9,
        isMock: true,
      };
    }
  }

  return {
    understood: false,
    action: 'unknown',
    route: null,
    filter: null,
    response:
      "Sorry, I didn't understand that command. Try saying 'show orders', 'go to queue', or 'open printers'.",
    confidence: 0.1,
    isMock: true,
  };
}

export async function interpretCommand(params: {
  command: string;
  currentPage: string;
}): Promise<CommandResult> {
  if (env.aiMode === 'mock') {
    return mockCommandInterpreter(params.command);
  }
  try {
    const availableRoutes = Object.values(ROUTE_MAP);
    const prompt = buildCommandInterpreterPrompt({ ...params, availableRoutes });
    const text = await callGemini(prompt);
    const parsed = safeParseJson<CommandResult>(text);
    if (!parsed) {
      console.error('[ai] Failed to parse command response:', text);
      return mockCommandInterpreter(params.command);
    }
    return parsed;
  } catch (err) {
    console.error('[ai] Command interpreter call failed, falling back to mock:', err);
    return mockCommandInterpreter(params.command);
  }
}

// ─────────────────────────────────────────────
// Feature 8: Smart Pickup ETA & Queue Readiness
// ─────────────────────────────────────────────

export type EtaPredictionResult = {
  estimatedMinutesMin: number;
  estimatedMinutesMax: number;
  estimatedTimeLabel: string;
  rushLevel: 'low' | 'moderate' | 'high';
  rushReason: string;
  pickupAdvice: string;
  confidence: number;
  isMock?: boolean;
};

function mockEtaPrediction(params: EtaPredictionParams): EtaPredictionResult {
  const status = params.currentStatus.toUpperCase();
  if (['CANCELLED', 'REJECTED'].includes(status)) {
    return {
      estimatedMinutesMin: 0,
      estimatedMinutesMax: 0,
      estimatedTimeLabel: 'Order cancelled',
      rushLevel: 'low',
      rushReason: 'This order was cancelled and is not being printed.',
      pickupAdvice: 'Please place a new print order if you still need your document printed.',
      confidence: 1.0,
      isMock: true,
    };
  }

  if (['FAILED'].includes(status)) {
    return {
      estimatedMinutesMin: 0,
      estimatedMinutesMax: 0,
      estimatedTimeLabel: 'Printer issue',
      rushLevel: 'high',
      rushReason: 'Printing encountered an error at the shop.',
      pickupAdvice: 'Please check with the shop counter staff for assistance.',
      confidence: 0.95,
      isMock: true,
    };
  }

  if (['COMPLETED', 'COLLECTED'].includes(status)) {
    return {
      estimatedMinutesMin: 0,
      estimatedMinutesMax: 0,
      estimatedTimeLabel: 'Ready for pickup now!',
      rushLevel: 'low',
      rushReason: 'Your print job is finished and safely stored at the pickup counter.',
      pickupAdvice: 'Head to the shop counter with your Pickup QR code to collect your prints.',
      confidence: 0.99,
      isMock: true,
    };
  }

  if (['PRINTING'].includes(status)) {
    return {
      estimatedMinutesMin: 1,
      estimatedMinutesMax: 2,
      estimatedTimeLabel: '1–2 minutes (printing now)',
      rushLevel: 'low',
      rushReason: 'Printer active. Your job is currently coming off the tray.',
      pickupAdvice: 'You can begin walking to the shop counter now.',
      confidence: 0.95,
      isMock: true,
    };
  }

  const jobsAhead = Math.max(0, params.jobsAhead);
  const totalSheets = params.totalPages * params.copies;

  // Base computation: 1.5 min per job ahead + job print duration (~0.1 min per sheet)
  const baseMinutes = Math.round(jobsAhead * 1.5 + totalSheets * 0.1);
  const minMin = Math.max(1, baseMinutes);
  const maxMin = minMin + Math.max(2, Math.round(jobsAhead * 0.5) + 1);

  const rushLevel: 'low' | 'moderate' | 'high' =
    jobsAhead >= 4 ? 'high' : jobsAhead >= 2 ? 'moderate' : 'low';

  const rushReason =
    rushLevel === 'high'
      ? `Queue is busy with ${jobsAhead} orders ahead during campus rush.`
      : rushLevel === 'moderate'
        ? `Moderate activity with ${jobsAhead} job${jobsAhead > 1 ? 's' : ''} ahead in queue.`
        : jobsAhead === 0
          ? 'Queue is clear! Your job is next to be processed.'
          : `Light queue with only ${jobsAhead} job ahead.`;

  const pickupAdvice =
    minMin <= 2
      ? 'Head to the counter shortly — your order will be ready in moments.'
      : `Best to walk over in about ${minMin - 1}–${minMin} minutes.`;

  return {
    estimatedMinutesMin: minMin,
    estimatedMinutesMax: maxMin,
    estimatedTimeLabel: `${minMin}–${maxMin} minutes`,
    rushLevel,
    rushReason,
    pickupAdvice,
    confidence: 0.88,
    isMock: true,
  };
}

export async function getEtaPrediction(params: EtaPredictionParams): Promise<EtaPredictionResult> {
  if (env.aiMode === 'mock') {
    return mockEtaPrediction(params);
  }
  try {
    const prompt = buildEtaPredictionPrompt(params);
    const text = await callGemini(prompt);
    const parsed = safeParseJson<EtaPredictionResult>(text);
    if (!parsed) {
      console.error('[ai] Failed to parse ETA prediction response:', text);
      return mockEtaPrediction(params);
    }
    return parsed;
  } catch (err) {
    console.error('[ai] ETA prediction call failed:', err);
    return mockEtaPrediction(params);
  }
}
