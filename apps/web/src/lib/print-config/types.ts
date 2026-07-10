export type PagePrintMode = 'bw' | 'color';

export type PaperSizeId = 'a4' | 'a3' | 'letter' | 'legal';

export type OrientationId = 'portrait' | 'landscape';

export type PageRangeMode = 'all' | 'custom' | 'odd' | 'even';

export type PageModeMap = Record<number, PagePrintMode>;

export type PrintConfig = {
  /** Upload id this config belongs to (payment handoff). */
  fileId: string | null;
  fileName: string | null;
  totalPages: number;
  pageModes: PageModeMap;
  copies: number;
  rangeMode: PageRangeMode;
  customRange: string;
  paperSize: PaperSizeId;
  orientation: OrientationId;
};

export type PrintConfigWarning = {
  id: string;
  tone: 'warning' | 'danger';
  message: string;
};

export type PrintConfigSummary = {
  totalPages: number;
  printablePages: number[];
  colorPages: number;
  bwPages: number;
  copies: number;
  paperSize: PaperSizeId;
  orientation: OrientationId;
  estimatedCost: number;
  rangeLabel: string;
  canContinue: boolean;
  warnings: PrintConfigWarning[];
};

export type PaperSizeOption = {
  id: PaperSizeId;
  label: string;
  enabled: boolean;
  hint?: string;
};
