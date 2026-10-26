import './globals.css';
const site = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : 'http://localhost:3000');
export const metadata = { metadataBase: new URL(site), title: 'GitMusice — Your code has a sound', description: 'Turn your GitHub contributions into a tier, a soundtrack and a README badge.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="font-sans antialiased">{children}</body></html>);
}
