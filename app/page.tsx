import Link from 'next/link';
import Nav from '../components/Nav';
import HeroSearch from '../components/HeroSearch';
import TierLadder from '../components/TierLadder';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#07090b]">
      <Nav hideSearch />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-16 sm:pt-24">
        <h1 className="max-w-2xl text-5xl font-semibold leading-[0.95] tracking-tighter sm:text-7xl">
          Your code has a <em className="font-serif font-normal italic text-lime-300">sound.</em>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-slate-300">
          Type a GitHub username. You get a tier based on lifetime contributions, a track that matches it, and a badge for your profile README.
        </p>
        <HeroSearch />
        <p className="mt-4 text-sm text-slate-400">
          No account needed. Try <Link className="text-cyan-300 underline" href="/torvalds">torvalds</Link>, <Link className="text-cyan-300 underline" href="/octocat">octocat</Link> or <Link className="text-cyan-300 underline" href="/gaearon">gaearon</Link>.
        </p>
        <div className="mt-24 sm:mt-32"><TierLadder /></div>
        <footer className="mt-24 border-t border-white/10 pt-6 text-sm text-slate-400">
          Built on public GitHub data. GitMusice is not affiliated with GitHub.
        </footer>
      </main>
    </div>
  );
}