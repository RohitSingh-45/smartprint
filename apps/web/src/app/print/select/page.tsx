import { PrintConfigPanel } from '@/components/print-config/PrintConfigPanel';
import { ScreenShell } from '@/components/ui/ScreenShell';

export const metadata = { title: 'Print settings' };

export default function SelectPagesPage() {
  return (
    <ScreenShell
      title="Print settings"
      subtitle="Choose color pages, copies, range, paper, and orientation. The summary updates as you tap."
    >
      <PrintConfigPanel />
    </ScreenShell>
  );
}
