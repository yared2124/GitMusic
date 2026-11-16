import './globals.css';
import type { Metadata } from 'next';

const site =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL
    : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: 'GitMusice — Your code has a classical symphony',
  description:
    'Turn your GitHub contributions into a 15-100% score, 6 criteria evaluation, and a dedicated classical piece.',
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'GitMusice',
    title: 'GitMusice — Your code has a classical symphony',
    description:
      'Turn your GitHub contributions into a 15-100% score, 6 criteria evaluation, and a dedicated classical piece.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'GitMusice' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitMusice — Your code has a classical symphony',
    description:
      'Turn your GitHub contributions into a 15-100% score, 6 criteria evaluation, and a dedicated classical piece.',
    images: ['/opengraph-image'],
  },
  icons: { icon: '/icon.svg', shortcut: '/icon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
