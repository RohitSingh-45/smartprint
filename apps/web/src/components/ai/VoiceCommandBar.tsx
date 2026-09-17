'use client';

import { Mic, MicOff, Send, X, Keyboard, Loader2 } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { fetchInterpretCommand, type CommandResult } from '@/lib/ai-api';
import { cn } from '@/lib/cn';

type Mode = 'closed' | 'text' | 'listening' | 'processing' | 'result';

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export function VoiceCommandBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<Mode>('closed');
  const [text, setText] = useState('');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<CommandResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check browser voice support
  useEffect(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    setVoiceSupported(!!SR);
  }, []);

  // Focus input when text mode opens
  useEffect(() => {
    if (mode === 'text' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [mode]);

  const close = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    }
    setMode('closed');
    setText('');
    setTranscript('');
    setResult(null);
    setError(null);
  }, []);

  // Execute result action
  useEffect(() => {
    if (!result || mode !== 'result') return;
    const timer = setTimeout(() => {
      if (result.action === 'navigate' && result.route) {
        router.push(result.route);
        close();
      } else if (result.action === 'filter_orders' && result.route) {
        const qs = result.filter ? `?status=${result.filter}` : '';
        router.push(`${result.route}${qs}`);
        close();
      } else if (result.action === 'refresh') {
        router.refresh();
        close();
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [result, mode, router, close]);

  const processCommand = useCallback(
    async (command: string) => {
      if (!command.trim()) return;
      setMode('processing');
      setError(null);
      try {
        const res = await fetchInterpretCommand({ command, currentPage: pathname });
        setResult(res);
        setMode('result');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Command failed.');
        setMode('text');
      }
    },
    [pathname],
  );

  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      const t = last?.[0]?.transcript ?? '';
      setTranscript(t);
      if (last?.isFinal && t.trim()) {
        void processCommand(t.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'aborted') {
        setError(`Mic error: ${event.error}. Try typing instead.`);
        setMode('text');
      }
    };

    recognition.onend = () => {
      if (mode === 'listening') setMode('text');
    };

    recognition.start();
    recognitionRef.current = recognition;
    setMode('listening');
    setTranscript('');
  }, [processCommand, mode]);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setMode('text');
  }, []);

  // Hotkey: Ctrl+K to open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setMode((m) => (m === 'closed' ? 'text' : 'closed'));
      }
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  return (
    <>
      {/* Floating trigger button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Expanded bar */}
        {mode !== 'closed' && (
          <div className="animate-rise w-[min(420px,calc(100vw-3rem))] rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)] backdrop-blur-md">
            {/* Bar header */}
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
              <Mic className="h-4 w-4 shrink-0 text-[var(--accent-strong)]" />
              <span className="flex-1 text-xs font-semibold text-[var(--foreground)]">
                {mode === 'listening'
                  ? '🎙 Listening…'
                  : mode === 'processing'
                    ? '⚡ Processing…'
                    : mode === 'result' && result
                      ? result.understood
                        ? '✅ Got it'
                        : '❓ Not understood'
                      : 'Voice / Text Command'}
              </span>
              <button
                onClick={close}
                className="rounded-[var(--radius-md)] p-0.5 text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Text input */}
              {(mode === 'text' || mode === 'listening') && (
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    value={mode === 'listening' ? transcript : text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && text.trim()) void processCommand(text.trim());
                    }}
                    placeholder={mode === 'listening' ? 'Listening…' : 'Type a command…'}
                    readOnly={mode === 'listening'}
                    className={cn(
                      'flex-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/20',
                      mode === 'listening' && 'text-[var(--muted)]',
                    )}
                  />
                  <button
                    onClick={() => void processCommand(text.trim())}
                    disabled={!text.trim() || mode === 'listening'}
                    className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-ink)] disabled:opacity-40"
                    aria-label="Send command"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Processing */}
              {mode === 'processing' && (
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--accent-strong)]" />
                  Interpreting:{' '}
                  <span className="font-medium text-[var(--foreground)]">
                    &ldquo;{text || transcript}&rdquo;
                  </span>
                </div>
              )}

              {/* Result */}
              {mode === 'result' && result && (
                <div
                  className={cn(
                    'rounded-[var(--radius-md)] border px-3 py-2.5',
                    result.understood
                      ? 'border-[var(--success)]/25 bg-[var(--success-soft)]'
                      : 'border-[var(--warning)]/25 bg-[var(--warning-soft)]',
                  )}
                >
                  <p
                    className={cn(
                      'text-sm font-medium',
                      result.understood ? 'text-[var(--success)]' : 'text-[var(--warning)]',
                    )}
                  >
                    {result.response}
                  </p>
                  {result.route && (
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      → {result.route}
                      {result.filter ? `?status=${result.filter}` : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Error */}
              {error && <p className="text-xs text-[var(--danger)]">{error}</p>}

              {/* Example commands */}
              {mode === 'text' && !text && (
                <div className="flex flex-wrap gap-1.5">
                  {['show orders', 'go to queue', 'pending orders', 'open printers'].map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => {
                        setText(cmd);
                        void processCommand(cmd);
                      }}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[11px] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              )}

              {/* Voice controls */}
              {voiceSupported && mode === 'text' && (
                <button
                  onClick={startVoice}
                  className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] py-2 text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                >
                  <Mic className="h-3.5 w-3.5" />
                  Or click to speak
                </button>
              )}

              {mode === 'listening' && (
                <button
                  onClick={stopVoice}
                  className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger-soft)] py-2 text-xs font-medium text-[var(--danger)]"
                >
                  <MicOff className="h-3.5 w-3.5" />
                  Stop listening
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main trigger button */}
        <button
          id="voice-command-trigger"
          onClick={() => (mode === 'closed' ? setMode('text') : close())}
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full shadow-[var(--shadow-lg)] transition-all duration-200 hover:scale-105 active:scale-95',
            mode === 'listening'
              ? 'animate-pulse-soft bg-[var(--danger)] text-white'
              : mode !== 'closed'
                ? 'bg-[var(--foreground)] text-[var(--background)]'
                : 'bg-[var(--accent)] text-[var(--accent-ink)]',
          )}
          aria-label="Open voice commands (Ctrl+K)"
          title="Voice commands (Ctrl+K)"
        >
          {mode === 'listening' ? (
            <MicOff className="h-5 w-5" />
          ) : mode !== 'closed' ? (
            <Keyboard className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>
      </div>
    </>
  );
}
