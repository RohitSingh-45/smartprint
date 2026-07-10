import { PageThumb } from '@/components/print/PageThumb';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ScreenShell } from '@/components/ui/ScreenShell';
import { MOCK_FILE, MOCK_PAGES } from '@/lib/mock-data';

export const metadata = { title: 'Preview' };

export default function PreviewPage() {
  return (
    <ScreenShell
      title="Preview pages"
      subtitle="Mock previews for Sprint 2. Next, choose which pages print in color."
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge tone="accent">{MOCK_FILE.name}</Badge>
        <Badge>{MOCK_FILE.pages} pages</Badge>
        <Badge>{MOCK_FILE.sizeLabel}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MOCK_PAGES.map((page) => (
          <PageThumb
            key={page.id}
            pageNumber={page.id}
            label={page.label}
            mode={page.mode}
            tone={page.previewTone}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/print/upload" variant="secondary" fullWidth>
          Replace file
        </Button>
        <Button href="/print/select" size="lg" fullWidth>
          Select color pages
        </Button>
      </div>
    </ScreenShell>
  );
}
