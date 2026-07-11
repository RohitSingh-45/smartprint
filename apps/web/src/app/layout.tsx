import type { Metadata } from 'next';
import { DM_Sans, Syne } from 'next/font/google';
import './globals.css';

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME || 'SmartPrint',
    template: `%s · ${process.env.NEXT_PUBLIC_APP_NAME || 'SmartPrint'}`,
  },
  description: 'QR-based smart printing for students and print shops',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('smartprint-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${syne.variable} ${dmSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
