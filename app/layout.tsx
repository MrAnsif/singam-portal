// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Singam Portal',
    template: '%s — Singam Portal',
  },
  description:
    'Internal bus travel expense and operations management dashboard.',
  robots: { index: false, follow: false }, // private internal tool
};

import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

