import { PrintConfigPanel } from '@/components/print-config/PrintConfigPanel';
import { ScreenShell } from '@/components/ui/ScreenShell';

export const metadata = { title: 'Print settings' };

export default function SelectPagesPage() {
  return (
    <ScreenShell
      title="Print settings"
      subtitle="Set page color, range, and paper. Your estimate updates as you go."
      compact
    >
      <PrintConfigPanel />
    </ScreenShell>
  );
}
