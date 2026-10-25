'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HeroSearch() {
  const [q, setQ] = useState('');
  const router = useRouter();
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); const u = q.trim().replace(/^@/, ''); if (u) router.push('/' + encodeURIComponent(u)); }}
      className="mt-10 flex max-w-xl items-end gap-3 border-b-2 border-white/25 pb-2 focus-within:border-lime-300"
    >
      <label htmlFor="hero-user" className="sr-only">GitHub username</label>
      <span className="pb-0.5 text-2xl text-slate-400" aria-hidden>@</span>
      <input
        id="hero-user" value={q} onChange={(e) => setQ(e.target.value)} placeholder="github-username"
        autoComplete="off" autoCapitalize="none" spellCheck={false}
        className="min-w-0 flex-1 bg-transparent text-xl outline-none placeholder:text-slate-500 focus-visible:outline-none sm:text-2xl"
      />
      <button type="submit" className="shrink-0 pb-1 text-base font-semibold text-lime-300 hover:text-lime-200">See my tier</button>
    </form>
  );
}