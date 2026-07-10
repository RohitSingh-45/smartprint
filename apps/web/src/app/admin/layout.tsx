'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar, AdminTopbar } from '@/components/admin/AdminChrome';
import { cn } from '@/lib/cn';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isPickup = pathname.startsWith('/admin/pickup');

  if (isPickup) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex min-h-dvh">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {open ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px]"
              aria-label="Close menu overlay"
              onClick={() => setOpen(false)}
            />
            <div className={cn('relative z-50 h-full w-64 shadow-xl')}>
              <AdminSidebar onNavigate={() => setOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar onMenuClick={() => setOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
