/**
 * Parse print-shop style ranges: "2-5,8,10".
 * Returns sorted unique page numbers, or an error message.
 */
export function parsePageRange(
  input: string,
  totalPages: number,
): { pages: number[]; error: string | null } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { pages: [], error: 'Enter a page range (example: 2-5,8,10).' };
  }

  if (totalPages < 1) {
    return { pages: [], error: 'No pages available.' };
  }

  if (!/^[0-9,\-\s]+$/.test(trimmed)) {
    return { pages: [], error: 'Use only numbers, commas, and dashes.' };
  }

  const parts = trimmed
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) {
    return { pages: [], error: 'Enter a page range (example: 2-5,8,10).' };
  }

  const set = new Set<number>();

  for (const part of parts) {
    if (part.includes('-')) {
      const [rawStart, rawEnd, ...rest] = part.split('-');
      if (
        rest.length ||
        rawStart === undefined ||
        rawEnd === undefined ||
        rawStart === '' ||
        rawEnd === ''
      ) {
        return { pages: [], error: `Invalid range "${part}".` };
      }
      const start = Number(rawStart);
      const end = Number(rawEnd);
      if (!Number.isInteger(start) || !Number.isInteger(end)) {
        return { pages: [], error: `Invalid range "${part}".` };
      }
      if (start > end) {
        return { pages: [], error: `Range "${part}" is backwards.` };
      }
      if (start < 1 || end > totalPages) {
        return { pages: [], error: `Range "${part}" is outside 1–${totalPages}.` };
      }
      for (let page = start; page <= end; page += 1) set.add(page);
      continue;
    }

    const page = Number(part);
    if (!Number.isInteger(page)) {
      return { pages: [], error: `Invalid page "${part}".` };
    }
    if (page < 1 || page > totalPages) {
      return { pages: [], error: `Page ${page} is outside 1–${totalPages}.` };
    }
    set.add(page);
  }

  const pages = Array.from(set).sort((a, b) => a - b);
  if (!pages.length) {
    return { pages: [], error: 'No printable pages in this range.' };
  }

  return { pages, error: null };
}

export function pagesForRangeMode(
  mode: 'all' | 'custom' | 'odd' | 'even',
  totalPages: number,
  customRange: string,
): { pages: number[]; error: string | null; label: string } {
  if (totalPages < 1) {
    return { pages: [], error: 'No pages available.', label: 'None' };
  }

  if (mode === 'all') {
    return {
      pages: Array.from({ length: totalPages }, (_, i) => i + 1),
      error: null,
      label: `All pages (1–${totalPages})`,
    };
  }

  if (mode === 'odd') {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p % 2 === 1);
    return { pages, error: pages.length ? null : 'No odd pages.', label: 'Odd pages' };
  }

  if (mode === 'even') {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p % 2 === 0);
    return { pages, error: pages.length ? null : 'No even pages.', label: 'Even pages' };
  }

  const parsed = parsePageRange(customRange, totalPages);
  return {
    pages: parsed.pages,
    error: parsed.error,
    label: parsed.error ? 'Custom range' : `Custom (${customRange.trim()})`,
  };
}
