import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function LandingHero() {
  return (
    <section className="relative isolate min-h-dvh overflow-hidden">
      <div className="hero-plane absolute inset-0 -z-10" aria-hidden />
      <div
        className="paper-grain absolute inset-0 -z-10 opacity-40 mix-blend-multiply dark:opacity-20 dark:mix-blend-soft-light"
        aria-hidden
      />

      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 sm:px-6">
        <header className="flex items-center justify-between py-5 animate-fade">
          <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
            SmartPrint
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button href="/admin" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Shop admin
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-end gap-10 pb-12 pt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-end lg:gap-12 lg:pb-16">
          <div className="max-w-xl animate-rise">
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Scan. Print. Collect.
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              The easiest QR print flow for students and campus shops — upload once, pick color
              pages, pay, and pick up.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="/print/qr" size="lg">
                Start with QR station
              </Button>
              <Button href="/print/upload" variant="secondary" size="lg">
                Skip to upload demo
              </Button>
            </div>
          </div>

          <div className="relative animate-float-in" aria-hidden>
            <div className="hero-visual relative mx-auto aspect-[4/3] w-full max-w-xl lg:max-w-none">
              <div className="absolute inset-[8%] rounded-[1.25rem] border border-white/30 bg-white/55 shadow-[0_30px_80px_rgba(8,28,48,0.18)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5" />
              <div className="absolute inset-[18%_22%_28%_12%] -rotate-6 rounded-lg bg-[#f3f7fb] shadow-lg dark:bg-[#1b2535]" />
              <div className="absolute inset-[22%_12%_18%_28%] rotate-3 rounded-lg bg-white shadow-xl dark:bg-[#243247]">
                <div className="space-y-2 p-5">
                  <div className="h-2 w-2/3 rounded-full bg-slate-300/80 dark:bg-slate-500/50" />
                  <div className="h-2 w-full rounded-full bg-slate-200/90 dark:bg-slate-600/40" />
                  <div className="h-2 w-5/6 rounded-full bg-slate-200/90 dark:bg-slate-600/40" />
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <span className="h-8 rounded bg-cyan-400/70" />
                    <span className="h-8 rounded bg-fuchsia-400/60" />
                    <span className="h-8 rounded bg-amber-300/70" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-[10%] right-[8%] flex h-28 w-28 items-center justify-center rounded-2xl bg-[var(--ink)] text-[var(--paper)] shadow-2xl dark:bg-cyan-300 dark:text-slate-950">
                <div className="grid grid-cols-3 gap-1 p-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-5 w-5 rounded-[3px] ${i % 2 === 0 ? 'bg-current' : 'bg-transparent border border-current/40'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="pb-6 text-center text-xs text-[var(--muted)] sm:text-left">
          Demo UI ·{' '}
          <Link href="/print/error?kind=printer-offline" className="underline underline-offset-2">
            View error states
          </Link>
        </p>
      </div>
    </section>
  );
}
