'use client';

type Props = {
  note: string;
  channels: Array<'browser' | 'email' | 'whatsapp'>;
};

export function NotificationChannelsStub({ note, channels }: Props) {
  return (
    <section
      aria-label="Notifications (coming later)"
      className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4"
    >
      <h2 className="text-sm font-semibold">Notifications</h2>
      <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {channels.map((channel) => (
          <li
            key={channel}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs capitalize text-[var(--muted)]"
          >
            {channel}
            <span className="ml-1.5 text-[10px] uppercase tracking-wide opacity-70">soon</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
