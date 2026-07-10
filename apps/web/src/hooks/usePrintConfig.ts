'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MAX_COPIES, MIN_COPIES } from '@/lib/print-config/constants';
import { createInitialPrintConfig, derivePrintSummary } from '@/lib/print-config/derive';
import {
  readPdfMetaSession,
  readPrintConfigSession,
  savePrintConfigSession,
} from '@/lib/print-config/storage';
import type {
  OrientationId,
  PagePrintMode,
  PageRangeMode,
  PaperSizeId,
  PrintConfig,
} from '@/lib/print-config/types';
import { readUploadSession } from '@/lib/upload-api';

function resolveBootstrap(): PrintConfig {
  const upload = readUploadSession();
  const meta = readPdfMetaSession();
  const existing = readPrintConfigSession();

  const fileId = meta?.fileId ?? upload?.id ?? null;
  const fileName = meta?.fileName ?? upload?.originalName ?? null;
  const totalPages = meta?.pageCount ?? existing?.totalPages ?? 0;

  if (
    existing &&
    existing.fileId === fileId &&
    existing.totalPages === totalPages &&
    totalPages > 0
  ) {
    return existing;
  }

  return createInitialPrintConfig({ fileId, fileName, totalPages });
}

export function usePrintConfig() {
  const [config, setConfig] = useState<PrintConfig>(() =>
    createInitialPrintConfig({
      fileId: null,
      fileName: null,
      totalPages: 0,
    }),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConfig(resolveBootstrap());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePrintConfigSession(config);
  }, [config, hydrated]);

  const summary = useMemo(() => derivePrintSummary(config), [config]);

  const togglePageMode = useCallback((page: number) => {
    setConfig((prev) => {
      const current = prev.pageModes[page] ?? 'bw';
      return {
        ...prev,
        pageModes: {
          ...prev.pageModes,
          [page]: current === 'color' ? 'bw' : 'color',
        },
      };
    });
  }, []);

  const setPageMode = useCallback((page: number, mode: PagePrintMode) => {
    setConfig((prev) => ({
      ...prev,
      pageModes: { ...prev.pageModes, [page]: mode },
    }));
  }, []);

  const setAllPageModes = useCallback((mode: PagePrintMode) => {
    setConfig((prev) => {
      const pageModes = { ...prev.pageModes };
      for (let page = 1; page <= prev.totalPages; page += 1) {
        pageModes[page] = mode;
      }
      return { ...prev, pageModes };
    });
  }, []);

  const setCopies = useCallback((copies: number) => {
    setConfig((prev) => ({
      ...prev,
      copies: Math.min(MAX_COPIES, Math.max(MIN_COPIES, Math.round(copies))),
    }));
  }, []);

  const setRangeMode = useCallback((rangeMode: PageRangeMode) => {
    setConfig((prev) => ({ ...prev, rangeMode }));
  }, []);

  const setCustomRange = useCallback((customRange: string) => {
    setConfig((prev) => ({ ...prev, customRange }));
  }, []);

  const setPaperSize = useCallback((paperSize: PaperSizeId) => {
    setConfig((prev) => ({ ...prev, paperSize }));
  }, []);

  const setOrientation = useCallback((orientation: OrientationId) => {
    setConfig((prev) => ({ ...prev, orientation }));
  }, []);

  return {
    config,
    summary,
    hydrated,
    togglePageMode,
    setPageMode,
    setAllPageModes,
    setCopies,
    setRangeMode,
    setCustomRange,
    setPaperSize,
    setOrientation,
  };
}
