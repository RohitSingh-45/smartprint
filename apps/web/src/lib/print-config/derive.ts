import { MAX_COPIES, MIN_COPIES, PRICE_PER_BW, PRICE_PER_COLOR } from './constants';
import { pagesForRangeMode } from './page-range';
import type { PageModeMap, PrintConfig, PrintConfigSummary, PrintConfigWarning } from './types';

export function createDefaultPageModes(totalPages: number): PageModeMap {
  const modes: PageModeMap = {};
  for (let page = 1; page <= totalPages; page += 1) {
    modes[page] = 'bw';
  }
  return modes;
}

export function createInitialPrintConfig(input: {
  fileId: string | null;
  fileName: string | null;
  totalPages: number;
}): PrintConfig {
  return {
    fileId: input.fileId,
    fileName: input.fileName,
    totalPages: input.totalPages,
    pageModes: createDefaultPageModes(input.totalPages),
    copies: MIN_COPIES,
    rangeMode: 'all',
    customRange: '',
    paperSize: 'a4',
    orientation: 'portrait',
  };
}

export function estimateCost(colorPages: number, bwPages: number, copies: number): number {
  const perCopy = colorPages * PRICE_PER_COLOR + bwPages * PRICE_PER_BW;
  return perCopy * copies;
}

export function derivePrintSummary(config: PrintConfig): PrintConfigSummary {
  const range = pagesForRangeMode(config.rangeMode, config.totalPages, config.customRange);
  const warnings: PrintConfigWarning[] = [];

  if (config.copies < MIN_COPIES) {
    warnings.push({
      id: 'copies-min',
      tone: 'danger',
      message: `At least ${MIN_COPIES} copy is required.`,
    });
  }

  if (config.copies > MAX_COPIES) {
    warnings.push({
      id: 'copies-max',
      tone: 'danger',
      message: `Maximum ${MAX_COPIES} copies allowed per job.`,
    });
  }

  if (range.error) {
    warnings.push({ id: 'range-invalid', tone: 'danger', message: range.error });
  }

  if (!range.error && range.pages.length === 0) {
    warnings.push({
      id: 'zero-pages',
      tone: 'danger',
      message: 'No printable pages selected. Adjust the page range.',
    });
  }

  let colorPages = 0;
  let bwPages = 0;
  for (const page of range.pages) {
    if (config.pageModes[page] === 'color') colorPages += 1;
    else bwPages += 1;
  }

  if (!range.error && range.pages.length > 0 && colorPages === range.pages.length) {
    warnings.push({
      id: 'all-color',
      tone: 'warning',
      message:
        'All selected pages are Color — this will cost more. Switch diagrams-only pages to B&W if you can.',
    });
  }

  const estimatedCost = estimateCost(colorPages, bwPages, config.copies);
  const blocking = warnings.some((w) => w.tone === 'danger');

  return {
    totalPages: config.totalPages,
    printablePages: range.pages,
    colorPages,
    bwPages,
    copies: config.copies,
    paperSize: config.paperSize,
    orientation: config.orientation,
    estimatedCost,
    rangeLabel: range.label,
    canContinue: !blocking && range.pages.length > 0 && config.totalPages > 0,
    warnings,
  };
}
