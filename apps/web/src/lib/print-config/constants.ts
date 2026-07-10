import type { PaperSizeOption } from './types';

/** B&W page price in INR (demo rates). */
export const PRICE_PER_BW = 2;

/** Color page price in INR (demo rates). */
export const PRICE_PER_COLOR = 8;

export const MIN_COPIES = 1;
export const MAX_COPIES = 20;

export const DEFAULT_PAPER_SIZE = 'a4' as const;
export const DEFAULT_ORIENTATION = 'portrait' as const;

export const PAPER_SIZES: PaperSizeOption[] = [
  { id: 'a4', label: 'A4', enabled: true, hint: 'Default shop stock' },
  { id: 'a3', label: 'A3', enabled: false, hint: 'Coming soon' },
  { id: 'letter', label: 'Letter', enabled: false, hint: 'Coming soon' },
  { id: 'legal', label: 'Legal', enabled: false, hint: 'Coming soon' },
];

export const PRINT_CONFIG_STORAGE_KEY = 'smartprint:print-config';
export const PDF_META_STORAGE_KEY = 'smartprint:pdf-meta';
