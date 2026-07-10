export const metadata = { title: 'Admin' };

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight sm:text-3xl">
        Dashboard layout
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        Sprint 2 ships sidebar + topbar only. Queue, printers, and orders arrive in later sprints —
        this shell keeps shop navigation ready.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3" id="queue">
        {['Jobs in queue', 'Printers online', 'Paid today'].map((label) => (
          <div
            key={label}
            className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-6"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
            <p className="mt-3 text-sm text-[var(--muted)]">Placeholder</p>
          </div>
        ))}
      </div>

      <section className="mt-8" id="printers">
        <h2 className="text-sm font-semibold">Printers</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Layout placeholder — no live printer data yet.
        </p>
      </section>

      <section className="mt-8" id="orders">
        <h2 className="text-sm font-semibold">Orders</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Layout placeholder — order tables come with backend sprints.
        </p>
      </section>

      <section className="mt-8" id="settings">
        <h2 className="text-sm font-semibold">Settings</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Layout placeholder — pricing and station config later.
        </p>
      </section>
    </div>
  );
}
