import { FileUploader } from '@/components/print/FileUploader';
import { ScreenShell } from '@/components/ui/ScreenShell';

export const metadata = { title: 'Upload' };

export default function UploadPage() {
  return (
    <ScreenShell
      title="Upload your file"
      subtitle="PDF, DOCX, JPG, or PNG up to 25 MB. Files are validated on the server and stored temporarily."
    >
      <FileUploader />
    </ScreenShell>
  );
}
