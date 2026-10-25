import Link from 'next/link';
import Nav from '../../components/Nav';
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07090b]">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-24 text-center">
        <p className="text-6xl font-semibold tracking-tighter text-slate-500">404</p>
        <h1 className="mt-4 text-2xl font-semibold">No GitHub user found</h1>
        <p className="mt-2 text-slate-400">Check the spelling, or search for another username above.</p>
        <Link href="/" className="mt-6 inline-block rounded-lg border border-white/15 px-4 py-2 text-sm hover:border-lime-300">Back to home</Link>
      </main>
    </div>
  );
}
