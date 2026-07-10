'use client';

import Link from 'next/link';
import { ArrowRight, QrCode, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function LandingHero() {
  return (
    <section className="relative isolate min-h-dvh overflow-hidden">
      <div className="hero-plane absolute inset-0 -z-10" aria-hidden />
      <div
        className="paper-grain absolute inset-0 -z-10 opacity-35 mix-blend-multiply dark:opacity-15 dark:mix-blend-soft-light"
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

        <div className="flex flex-1 flex-col justify-end gap-10 pb-12 pt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-end lg:gap-14 lg:pb-16">
          <div className="max-w-xl animate-rise">
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
              Campus print, simplified
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              Scan. Print.
              <br />
              Collect.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              QR-based smart printing for students and shops — upload once, configure pages, pay,
              and pick up when ready.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="/print/qr" size="lg" icon={QrCode} iconRight={ArrowRight}>
                Start with QR station
              </Button>
              <Button href="/print/upload" variant="ghost" size="lg" icon={Upload}>
                Skip to upload
              </Button>
            </div>
            <p className="mt-6 text-xs text-[var(--muted)]">
              No account required · Secure checkout · Live pickup tracking
            </p>
          </div>

          <div className="relative animate-float-in" aria-hidden>
            <div className="hero-visual relative mx-auto aspect-[4/3] w-full max-w-xl lg:max-w-none">
              <div className="absolute inset-[8%] rounded-[1.35rem] border border-white/40 bg-white/50 shadow-[var(--shadow-lg)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]" />
              <div className="absolute inset-[18%_22%_28%_12%] -rotate-6 rounded-[var(--radius-lg)] bg-[var(--surface-2)] shadow-[var(--shadow-md)]" />
              <div className="absolute inset-[22%_12%_18%_28%] rotate-3 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
                <div className="space-y-2.5 p-5">
                  <div className="flex items-center justify-between">
                    <div className="h-2 w-24 rounded-full bg-[var(--surface-3)]" />
                    <div className="h-5 w-14 rounded-md bg-[var(--accent-soft)]" />
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--surface-2)]" />
                  <div className="h-2 w-5/6 rounded-full bg-[var(--surface-2)]" />
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <span className="h-9 rounded-[var(--radius-md)] bg-[var(--accent)]/35" />
                    <span className="h-9 rounded-[var(--radius-md)] bg-[var(--surface-3)]" />
                    <span className="h-9 rounded-[var(--radius-md)] bg-[var(--warning-soft)]" />
                  </div>
                  <div className="mt-3 h-8 rounded-[var(--radius-md)] bg-[var(--accent)]" />
                </div>
              </div>
              <div className="absolute bottom-[10%] right-[8%] flex h-28 w-28 items-center justify-center rounded-[1.15rem] bg-[var(--ink)] text-[var(--paper)] shadow-[var(--shadow-lg)] dark:bg-[var(--accent)] dark:text-[var(--accent-ink)]">
                <QrCode className="h-12 w-12" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-[var(--border)]/60 py-5 text-xs text-[var(--muted)]">
          <span>SmartPrint</span>
          <Link href="/admin" className="hover:text-[var(--foreground)] underline-offset-2 hover:underline">
            Shop console
          </Link>
        </footer>
      </div>
    </section>
  );
}
