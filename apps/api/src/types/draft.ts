export const DRAFT_STATUSES = ['created', 'updated', 'expired', 'deleted'] as const;
export type DraftStatus = (typeof DRAFT_STATUSES)[number];

export const PAGE_RANGE_MODES = ['all', 'custom', 'odd', 'even'] as const;
export type DraftPageRangeMode = (typeof PAGE_RANGE_MODES)[number];

export const PAPER_SIZES = ['a4', 'a3', 'letter', 'legal'] as const;
export type DraftPaperSize = (typeof PAPER_SIZES)[number];

export const ORIENTATIONS = ['portrait', 'landscape'] as const;
export type DraftOrientation = (typeof ORIENTATIONS)[number];

export type DraftPageRange = {
  mode: DraftPageRangeMode;
  custom: string;
  pages: number[];
};

export type DraftOrder = {
  id: string;
  uploadId: string;
  fileName: string;
  fileSize: number;
  totalPages: number;
  colorPages: number[];
  bwPages: number[];
  copies: number;
  pageRange: DraftPageRange;
  paperSize: DraftPaperSize;
  orientation: DraftOrientation;
  estimatedPrice: number;
  status: DraftStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

export type DraftInput = {
  uploadId: string;
  fileName: string;
  fileSize: number;
  totalPages: number;
  colorPages: number[];
  bwPages: number[];
  copies: number;
  pageRange: DraftPageRange;
  paperSize: DraftPaperSize;
  orientation: DraftOrientation;
  estimatedPrice: number;
};

export type DraftPublic = DraftOrder & {
  secondsRemaining: number;
  isExpired: boolean;
};
