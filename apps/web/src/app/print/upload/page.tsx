import { FileDropzone } from '@/components/print/FileDropzone';
import { ScreenShell } from '@/components/ui/ScreenShell';

export const metadata = { title: 'Upload' };

export default function UploadPage() {
  return (
    <ScreenShell
      title="Upload your file"
      subtitle="PDF, DOCX, or image. We’ll show page previews next so you can mark color vs black & white."
    >
      <FileDropzone />
    </ScreenShell>
  );
}
