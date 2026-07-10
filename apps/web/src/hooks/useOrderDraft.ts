'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildDraftPayload,
  createDraft,
  deleteDraft,
  formatCountdown,
  getDraft,
  readDraftIdSession,
  saveDraftIdSession,
  updateDraft,
  type DraftDto,
} from '@/lib/draft/draft-api';
import type { PrintConfig, PrintConfigSummary } from '@/lib/print-config/types';
import { readUploadSession } from '@/lib/upload-api';

type Options = {
  config: PrintConfig;
  summary: PrintConfigSummary;
  hydrated: boolean;
  enabled: boolean;
};

export function useOrderDraft({ config, summary, hydrated, enabled }: Options) {
  const [draft, setDraft] = useState<DraftDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const draftIdRef = useRef<string | null>(null);
  const bootstrapped = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const secondsRemaining = useMemo(() => {
    if (!draft) return 0;
    const expires = new Date(draft.expiresAt).getTime();
    return Math.max(0, Math.floor((expires - nowTick) / 1000));
  }, [draft, nowTick]);

  const expired = Boolean(draft && secondsRemaining <= 0);

  const syncDraft = useCallback(async () => {
    if (!enabled || !summary.canContinue || !config.fileId) return;

    const upload = readUploadSession();
    if (!upload || upload.id !== config.fileId) {
      setError('Upload missing. Re-upload your PDF to create a draft.');
      return;
    }

    const payload = buildDraftPayload(config, summary, upload);
    setSyncing(true);
    setError(null);

    try {
      let next: DraftDto;
      if (draftIdRef.current) {
        try {
          next = await updateDraft(draftIdRef.current, payload);
        } catch (err) {
          const status = (err as { status?: number }).status;
          if (status === 404 || status === 410) {
            saveDraftIdSession(null);
            draftIdRef.current = null;
            next = await createDraft(payload);
          } else {
            throw err;
          }
        }
      } else {
        next = await createDraft(payload);
      }

      draftIdRef.current = next.id;
      saveDraftIdSession(next.id);
      setDraft(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sync draft.');
    } finally {
      setSyncing(false);
    }
  }, [config, summary, enabled]);

  // Restore existing draft on refresh, then keep it in sync.
  useEffect(() => {
    if (!hydrated || !enabled || bootstrapped.current) return;
    bootstrapped.current = true;

    const existingId = readDraftIdSession();
    if (!existingId) {
      void syncDraft();
      return;
    }

    void (async () => {
      setSyncing(true);
      try {
        const restored = await getDraft(existingId);
        draftIdRef.current = restored.id;
        saveDraftIdSession(restored.id);
        setDraft(restored);
        // Push latest local config after restore.
        await syncDraft();
      } catch {
        saveDraftIdSession(null);
        draftIdRef.current = null;
        await syncDraft();
      } finally {
        setSyncing(false);
      }
    })();
  }, [hydrated, enabled, syncDraft]);

  // Debounced updates when configuration changes.
  useEffect(() => {
    if (!hydrated || !enabled || !bootstrapped.current) return;
    if (!summary.canContinue) return;

    const handle = window.setTimeout(() => {
      void syncDraft();
    }, 450);

    return () => window.clearTimeout(handle);
  }, [
    hydrated,
    enabled,
    summary.canContinue,
    summary.estimatedCost,
    summary.colorPages,
    summary.bwPages,
    summary.printablePages,
    config.copies,
    config.rangeMode,
    config.customRange,
    config.orientation,
    config.paperSize,
    config.pageModes,
    syncDraft,
  ]);

  const removeDraft = useCallback(async () => {
    const id = draftIdRef.current;
    if (!id) return;
    setSyncing(true);
    try {
      await deleteDraft(id);
      draftIdRef.current = null;
      saveDraftIdSession(null);
      setDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete draft.');
    } finally {
      setSyncing(false);
    }
  }, []);

  return {
    draft,
    error,
    syncing,
    secondsRemaining,
    expired,
    countdownLabel: formatCountdown(secondsRemaining),
    refresh: syncDraft,
    removeDraft,
  };
}
