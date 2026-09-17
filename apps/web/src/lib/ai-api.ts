/**
 * Frontend AI API client.
 * All calls go through the SmartPrint backend (/api/ai/*).
 * The backend holds the Gemini key — it is never exposed to the browser.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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
// Helpers
// ─────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_URL}/api/ai${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `AI request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api/ai${path}`, { cache: 'no-store' });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `AI request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// API Functions
// ─────────────────────────────────────────────

export async function fetchConfigAdvisor(params: {
  fileName: string;
  totalPages: number;
  colorPageCount: number;
  bwPageCount: number;
  currentCopies: number;
  currentPaperSize: string;
  currentOrientation: string;
}): Promise<ConfigAdvisorResult> {
  const data = await post<{ advice: ConfigAdvisorResult }>('/config-advisor', params);
  return data.advice;
}

export async function fetchDashboardInsights(): Promise<DashboardInsightsResult> {
  const data = await get<{ insights: DashboardInsightsResult }>('/dashboard-insights');
  return data.insights;
}

export async function fetchOrderRisk(params: {
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
}): Promise<OrderRiskResult> {
  const data = await post<{ risk: OrderRiskResult }>('/order-risk', params);
  return data.risk;
}

export async function fetchSummaryExplainer(params: {
  fileName: string;
  totalPages: number;
  printablePages: number;
  colorPages: number;
  bwPages: number;
  copies: number;
  paperSize: string;
  orientation: string;
  estimatedCost: number;
}): Promise<SummaryExplainerResult> {
  const data = await post<{ explanation: SummaryExplainerResult }>('/summary-explainer', params);
  return data.explanation;
}

// ─────────────────────────────────────────────
// RAG Trend Analysis
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

export async function fetchTrendAnalysis(days = 30): Promise<TrendAnalysisResult> {
  const data = await get<{ trends: TrendAnalysisResult }>(`/trend-analysis?days=${days}`);
  return data.trends;
}

// ─────────────────────────────────────────────
// Computer Vision PDF Classification
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

export async function fetchPdfClassification(params: {
  uploadId: string;
  fileName: string;
}): Promise<PdfClassificationResult> {
  const data = await post<{ classification: PdfClassificationResult }>('/classify-pdf', params);
  return data.classification;
}

// ─────────────────────────────────────────────
// Voice / Text Command
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

export async function fetchInterpretCommand(params: {
  command: string;
  currentPage: string;
}): Promise<CommandResult> {
  const data = await post<{ result: CommandResult }>('/command', params);
  return data.result;
}

// ─────────────────────────────────────────────
// Smart Pickup ETA & Queue Readiness Predictor
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

export async function fetchEtaPrediction(params: {
  queuePosition: number;
  jobsAhead: number;
  totalPages: number;
  colorPages: number;
  bwPages: number;
  copies: number;
  paperSize: string;
  currentStatus: string;
}): Promise<EtaPredictionResult> {
  const data = await post<{ prediction: EtaPredictionResult }>('/eta-prediction', params);
  return data.prediction;
}
