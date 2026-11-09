import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const head = Bricolage_Grotesque({ variable: '--font-head', subsets: ['latin'], weight: ['500', '700'] });
const body = IBM_Plex_Sans({ variable: '--font-body', subsets: ['latin'], weight: ['400', '500', '600'] });
const code = JetBrains_Mono({ variable: '--font-code', subsets: ['latin'], weight: ['400', '600'] });

export const metadata: Metadata = {
  title: 'Offer in 90',
  description: '90-day plan for frontend and forward-deployed engineer interviews: daily checklist, notes, progress and a weekly update feed.',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: [{ media: '(prefers-color-scheme: light)', color: '#f4f6f5' }, { media: '(prefers-color-scheme: dark)', color: '#0f1513' }] };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${head.variable} ${body.variable} ${code.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
