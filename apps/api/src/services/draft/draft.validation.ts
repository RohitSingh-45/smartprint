import {
  ORIENTATIONS,
  PAPER_SIZES,
  PAGE_RANGE_MODES,
  type DraftInput,
  type DraftPageRange,
} from '../../types/draft';

export class DraftValidationError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = 'DRAFT_INVALID') {
    super(message);
    this.name = 'DraftValidationError';
    this.status = status;
    this.code = code;
  }
}

const MIN_COPIES = 1;
const MAX_COPIES = 20;

function assertIntegerArray(name: string, values: unknown): number[] {
  if (!Array.isArray(values) || !values.every((v) => Number.isInteger(v) && v > 0)) {
    throw new DraftValidationError(
      `${name} must be an array of positive integers.`,
      400,
      'INVALID_PAGES',
    );
  }
  return values as number[];
}

function parsePageRange(raw: unknown, totalPages: number): DraftPageRange {
  if (!raw || typeof raw !== 'object') {
    throw new DraftValidationError('pageRange is required.', 400, 'RANGE_REQUIRED');
  }

  const range = raw as Record<string, unknown>;
  const mode = range.mode;
  if (typeof mode !== 'string' || !(PAGE_RANGE_MODES as readonly string[]).includes(mode)) {
    throw new DraftValidationError('Invalid pageRange.mode.', 400, 'RANGE_MODE_INVALID');
  }

  const custom = typeof range.custom === 'string' ? range.custom : '';
  const pages = assertIntegerArray('pageRange.pages', range.pages);

  if (pages.length === 0) {
    throw new DraftValidationError('pageRange.pages cannot be empty.', 400, 'RANGE_EMPTY');
  }

  for (const page of pages) {
    if (page > totalPages) {
      throw new DraftValidationError(
        `Page ${page} is outside 1–${totalPages}.`,
        400,
        'RANGE_OUT_OF_BOUNDS',
      );
    }
  }

  if (mode === 'custom' && !custom.trim()) {
    throw new DraftValidationError(
      'Custom page range text is required.',
      400,
      'RANGE_CUSTOM_EMPTY',
    );
  }

  const uniqueSorted = Array.from(new Set(pages)).sort((a, b) => a - b);

  return {
    mode: mode as DraftPageRange['mode'],
    custom,
    pages: uniqueSorted,
  };
}

export function parseDraftInput(body: unknown): DraftInput {
  if (!body || typeof body !== 'object') {
    throw new DraftValidationError('Request body is required.', 400, 'BODY_REQUIRED');
  }

  const data = body as Record<string, unknown>;

  if (typeof data.uploadId !== 'string' || !data.uploadId.trim()) {
    throw new DraftValidationError('uploadId is required.', 400, 'UPLOAD_REQUIRED');
  }
  if (typeof data.fileName !== 'string' || !data.fileName.trim()) {
    throw new DraftValidationError('fileName is required.', 400, 'FILE_NAME_REQUIRED');
  }
  if (!Number.isInteger(data.fileSize) || (data.fileSize as number) < 0) {
    throw new DraftValidationError(
      'fileSize must be a non-negative integer.',
      400,
      'FILE_SIZE_INVALID',
    );
  }
  if (!Number.isInteger(data.totalPages) || (data.totalPages as number) < 1) {
    throw new DraftValidationError('totalPages must be at least 1.', 400, 'TOTAL_PAGES_INVALID');
  }

  const totalPages = data.totalPages as number;
  const colorPages = assertIntegerArray('colorPages', data.colorPages);
  const bwPages = assertIntegerArray('bwPages', data.bwPages);

  if (!Number.isInteger(data.copies)) {
    throw new DraftValidationError('copies must be an integer.', 400, 'COPIES_INVALID');
  }
  const copies = data.copies as number;
  if (copies < MIN_COPIES || copies > MAX_COPIES) {
    throw new DraftValidationError(
      `copies must be between ${MIN_COPIES} and ${MAX_COPIES}.`,
      400,
      'COPIES_OUT_OF_RANGE',
    );
  }

  if (
    typeof data.paperSize !== 'string' ||
    !(PAPER_SIZES as readonly string[]).includes(data.paperSize)
  ) {
    throw new DraftValidationError('Invalid paperSize.', 400, 'PAPER_INVALID');
  }
  if (data.paperSize !== 'a4') {
    throw new DraftValidationError(
      'Only A4 paper is available right now.',
      400,
      'PAPER_UNAVAILABLE',
    );
  }

  if (
    typeof data.orientation !== 'string' ||
    !(ORIENTATIONS as readonly string[]).includes(data.orientation)
  ) {
    throw new DraftValidationError('Invalid orientation.', 400, 'ORIENTATION_INVALID');
  }

  if (
    typeof data.estimatedPrice !== 'number' ||
    Number.isNaN(data.estimatedPrice) ||
    data.estimatedPrice < 0
  ) {
    throw new DraftValidationError(
      'estimatedPrice must be a non-negative number.',
      400,
      'PRICE_INVALID',
    );
  }

  const pageRange = parsePageRange(data.pageRange, totalPages);

  // Color + B&W must cover exactly the printable pages, no overlap.
  const printable = new Set(pageRange.pages);
  const colorSet = new Set(colorPages);
  const bwSet = new Set(bwPages);

  for (const page of colorPages) {
    if (!printable.has(page)) {
      throw new DraftValidationError(
        `Color page ${page} is not in the printable range.`,
        400,
        'COLOR_OUT_OF_RANGE',
      );
    }
    if (bwSet.has(page)) {
      throw new DraftValidationError(
        `Page ${page} cannot be both color and black & white.`,
        400,
        'PAGE_MODE_CONFLICT',
      );
    }
  }

  for (const page of bwPages) {
    if (!printable.has(page)) {
      throw new DraftValidationError(
        `B&W page ${page} is not in the printable range.`,
        400,
        'BW_OUT_OF_RANGE',
      );
    }
  }

  for (const page of pageRange.pages) {
    if (!colorSet.has(page) && !bwSet.has(page)) {
      throw new DraftValidationError(
        `Page ${page} is missing a print mode.`,
        400,
        'PAGE_MODE_MISSING',
      );
    }
  }

  return {
    uploadId: data.uploadId.trim(),
    fileName: data.fileName.trim().slice(0, 180),
    fileSize: data.fileSize as number,
    totalPages,
    colorPages: Array.from(colorSet).sort((a, b) => a - b),
    bwPages: Array.from(bwSet).sort((a, b) => a - b),
    copies,
    pageRange,
    paperSize: data.paperSize as DraftInput['paperSize'],
    orientation: data.orientation as DraftInput['orientation'],
    estimatedPrice: Math.round(data.estimatedPrice as number),
  };
}
