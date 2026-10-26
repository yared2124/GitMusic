'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function HeroSearch() {
  const [q, setQ] = useState('');
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const u = q.trim().replace(/^@/, ''); if (u) router.push('/' + encodeURIComponent(u)); }}
      className="flex max-w-xl items-center gap-3 border border-lime-300/30 bg-white/[.035] p-1.5 transition focus-within:border-lime-300/70"
    >
      <label htmlFor="hero-user" className="sr-only">GitHub username</label>
      <span className="pl-2 text-lg text-cyan-300" aria-hidden>@</span>
      <input
        id="hero-user" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Enter your GitHub username"
        autoComplete="off" autoCapitalize="none" spellCheck={false}
        className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 focus-visible:outline-none sm:text-base"
      />
      <button type="submit" className="lime-button shrink-0 px-3 py-3 text-[9px] sm:px-4 sm:text-[10px]">
        Create my vibe <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}