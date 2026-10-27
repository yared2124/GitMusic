import './globals.css';
import type { Metadata } from 'next';
import { Inter, Instrument_Serif } from 'next/font/google';

const site = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : 'http://localhost:3000');
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-instrument-serif' });

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: 'GitMusice — Your code has a sound',
  description: 'Turn your GitHub contributions into a tier, a soundtrack and a README badge.',
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'GitMusice',
    title: 'GitMusice — Your code has a sound',
    description: 'Turn your GitHub contributions into a tier, a soundtrack and a README badge.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'GitMusice — Your code has a sound' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitMusice — Your code has a sound',
    description: 'Turn your GitHub contributions into a tier, a soundtrack and a README badge.',
    images: ['/opengraph-image'],
  },
  icons: { icon: '/icon.svg', shortcut: '/icon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className={`${inter.variable} ${instrumentSerif.variable} font-sans antialiased`}>{children}</body></html>);
}
