'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function HeroSearch() {
  const [q, setQ] = useState('');
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const u = q.trim().replace(/^@/, '');
        if (u) router.push('/' + encodeURIComponent(u));
      }}
      className="hero-search"
    >
      <label htmlFor="hero-user" className="sr-only">GitHub username</label>
      <span className="pl-3 text-lg text-cyan-300" aria-hidden>@</span>
      <input
        id="hero-user"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="your-github-username"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-slate-500 focus-visible:outline-none"
      />
      <button type="submit" className="lime-button shrink-0">
        <span className="hidden sm:inline">Create my vibe</span>
        <span className="sm:hidden">Go</span>
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}