import { PriceBreakdown } from '@/components/print/PriceBreakdown';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';

export const metadata = { title: 'Price summary' };

export default function SummaryPage() {
  return (
    <ScreenShell
      title="Price summary"
      subtitle="Review the estimate before paying. Dummy rates for the demo journey."
    >
      <PriceBreakdown />
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/print/select" variant="secondary" fullWidth>
          Edit page modes
        </Button>
        <Button href="/print/payment" size="lg" fullWidth>
          Continue to payment
        </Button>
      </div>
    </ScreenShell>
  );
}
