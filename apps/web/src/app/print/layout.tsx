import { PrintFlowChrome } from '@/components/print/PrintFlowChrome';

export default function PrintFlowLayout({ children }: { children: React.ReactNode }) {
  return <PrintFlowChrome>{children}</PrintFlowChrome>;
}
