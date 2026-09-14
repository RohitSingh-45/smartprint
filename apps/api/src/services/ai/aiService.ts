import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { safeParseJson } from './aiUtils';
import {
  buildConfigAdvisorPrompt,
  buildDashboardInsightsPrompt,
  buildOrderRiskPrompt,
  buildSummaryExplainerPrompt,
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
  const isPresentation = name.includes('slide') || name.includes('ppt') || name.includes('presentation');
  const isInvoice = name.includes('invoice') || name.includes('bill') || name.includes('receipt');

  let documentType = 'Document';
  let recommendation = '';
  let suggestedColorMode: ConfigAdvisorResult['suggestedColorMode'] = 'all_bw';
  let tips: string[] = [];

  if (isResume) {
    documentType = 'Resume / CV';
    recommendation = 'Resumes are text-heavy and look professional in B&W. Printing in black-and-white saves you money without affecting quality.';
    suggestedColorMode = 'all_bw';
    tips = ['Use A4 portrait for standard resume formatting.', 'Single copy is usually sufficient for walk-in submission.'];
  } else if (isPresentation) {
    documentType = 'Presentation Slides';
    recommendation = 'Presentation slides often have colored charts and graphics that lose clarity in B&W. Color printing is recommended here.';
    suggestedColorMode = params.colorPageCount > params.bwPageCount ? 'all_color' : 'mixed';
    tips = ['Consider landscape orientation for slide decks.', 'If slides are text-only, B&W saves ₹' + (params.totalPages * 6) + '.'];
  } else if (isInvoice) {
    documentType = 'Invoice / Bill';
    recommendation = 'Invoices and bills are best printed in B&W. The information is clear and it is the most cost-effective option.';
    suggestedColorMode = 'all_bw';
    tips = ['A4 portrait is standard for invoices.', 'Verify total pages match the number of invoice sheets needed.'];
  } else {
    documentType = 'General Document';
    recommendation = params.colorPageCount > Math.floor(params.totalPages / 2)
      ? 'More than half your pages have color content. Color printing will preserve your document\'s full fidelity.'
      : 'Most of your pages appear to be text. Switching to B&W printing will save you cost without affecting readability.';
    suggestedColorMode = params.colorPageCount > params.bwPageCount ? 'all_color' : 'all_bw';
    tips = ['Review page range to print only the pages you need.', 'For multi-page documents, double-sided printing (if available) halves your paper use.'];
  }

  const colorSaving = params.colorPageCount * 6;
  return {
    documentType,
    recommendation,
    suggestedColorMode,
    suggestedCopies: params.currentCopies,
    suggestedPaperSize: params.currentPaperSize as ConfigAdvisorResult['suggestedPaperSize'],
    suggestedOrientation: isPresentation ? 'landscape' : 'portrait',
    costSaving: colorSaving > 0 && suggestedColorMode === 'all_bw'
      ? `Switching ${params.colorPageCount} color pages to B&W saves ₹${colorSaving}`
      : 'Your current color settings are optimized for this document.',
    tips,
    isMock: true,
  };
}

function mockDashboardInsights(params: Parameters<typeof buildDashboardInsightsPrompt>[0]): DashboardInsightsResult {
  const cancellationRate = params.totalOrdersToday > 0
    ? (params.cancelledOrders / params.totalOrdersToday) * 100
    : 0;

  const status: DashboardInsightsResult['status'] =
    params.pendingOrders > 5 || cancellationRate > 20 ? 'warning'
    : params.cancelledOrders > params.completedOrders ? 'critical'
    : 'healthy';

  const insights: DashboardInsight[] = [];

  if (params.todayRevenue > 0) {
    insights.push({
      type: 'revenue',
      title: `₹${params.todayRevenue.toLocaleString('en-IN')} earned today`,
      body: `You have processed ${params.totalOrdersToday} order${params.totalOrdersToday !== 1 ? 's' : ''} today with a total revenue of ₹${params.todayRevenue.toLocaleString('en-IN')}. ${params.completedOrders} jobs have been successfully completed.`,
      action: params.pendingOrders > 0 ? `Accept ${params.pendingOrders} pending orders to increase throughput.` : undefined,
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
    headline: status === 'healthy'
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

  if ((params.printAttempts ?? 0) >= 3) { riskScore += 60; reasons.push('multiple failed attempts'); }
  else if ((params.printAttempts ?? 0) >= 1) { riskScore += 20; reasons.push('previous attempt failed'); }

  if (params.lastPrintError) { riskScore += 20; reasons.push('active print error'); }
  if (params.waitingTimeMinutes != null && params.waitingTimeMinutes > 45) { riskScore += 25; reasons.push('long queue wait'); }
  else if (params.waitingTimeMinutes != null && params.waitingTimeMinutes > 20) { riskScore += 10; }

  const totalSheets = params.totalPages * params.copies;
  if (totalSheets > 100) { riskScore += 10; reasons.push('large job'); }

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
    suggestedAction: riskLevel === 'high'
      ? 'Check printer status and consider manually retrying or reassigning this job.'
      : riskLevel === 'medium'
      ? 'Monitor this job closely for any new errors.'
      : undefined,
    isMock: true,
  };
}

function mockSummaryExplainer(params: Parameters<typeof buildSummaryExplainerPrompt>[0]): SummaryExplainerResult {
  const totalSheets = params.printablePages * params.copies;
  const potentialSaving = params.colorPages > 0 ? params.colorPages * params.copies * 6 : 0;

  return {
    explanation: `You are printing ${params.printablePages} page${params.printablePages !== 1 ? 's' : ''} from "${params.fileName}" on ${params.paperSize.toUpperCase()} paper in ${params.orientation} orientation. With ${params.copies} cop${params.copies !== 1 ? 'ies' : 'y'}, that is ${totalSheets} sheet${totalSheets !== 1 ? 's' : ''} total, costing an estimated ₹${params.estimatedCost}.`,
    valueNote: potentialSaving > 0
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

  const prompt = buildConfigAdvisorPrompt(params);
  const text = await callGemini(prompt);
  const parsed = safeParseJson<ConfigAdvisorResult>(text);

  if (!parsed) {
    console.error('[ai] Failed to parse config advisor response:', text);
    return mockConfigAdvisor(params);
  }
  return parsed;
}

export async function getDashboardInsights(
  params: Parameters<typeof buildDashboardInsightsPrompt>[0],
): Promise<DashboardInsightsResult> {
  if (env.aiMode === 'mock') {
    return mockDashboardInsights(params);
  }

  const prompt = buildDashboardInsightsPrompt(params);
  const text = await callGemini(prompt);
  const parsed = safeParseJson<DashboardInsightsResult>(text);

  if (!parsed) {
    console.error('[ai] Failed to parse dashboard insights response:', text);
    return mockDashboardInsights(params);
  }
  return parsed;
}

export async function getOrderRisk(
  params: Parameters<typeof buildOrderRiskPrompt>[0],
): Promise<OrderRiskResult> {
  if (env.aiMode === 'mock') {
    return mockOrderRisk(params);
  }

  const prompt = buildOrderRiskPrompt(params);
  const text = await callGemini(prompt);
  const parsed = safeParseJson<OrderRiskResult>(text);

  if (!parsed) {
    console.error('[ai] Failed to parse order risk response:', text);
    return mockOrderRisk(params);
  }
  return parsed;
}

export async function getSummaryExplainer(
  params: Parameters<typeof buildSummaryExplainerPrompt>[0],
): Promise<SummaryExplainerResult> {
  if (env.aiMode === 'mock') {
    return mockSummaryExplainer(params);
  }

  const prompt = buildSummaryExplainerPrompt(params);
  const text = await callGemini(prompt);
  const parsed = safeParseJson<SummaryExplainerResult>(text);

  if (!parsed) {
    console.error('[ai] Failed to parse summary explainer response:', text);
    return mockSummaryExplainer(params);
  }
  return parsed;
}
