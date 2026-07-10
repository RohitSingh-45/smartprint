import { PageModeSelector } from '@/components/print/PageModeSelector';
import { ScreenShell } from '@/components/ui/ScreenShell';

export const metadata = { title: 'Page modes' };

export default function SelectPagesPage() {
  return (
    <ScreenShell
      title="Color or black & white"
      subtitle="Tap a page, then set its print mode. Color pages cost more — only mark what needs it."
    >
      <PageModeSelector />
    </ScreenShell>
  );
}
